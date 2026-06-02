# dashboard/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from suppliers.models import Supplier
from airlines.models import Airline
from airports.models import Airport
from transactions.models import FuelTransaction

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        
        # Get all data (no user filtering to avoid errors)
        transactions = FuelTransaction.objects.all()
        suppliers = Supplier.objects.all()
        airlines = Airline.objects.all()
        airports = Airport.objects.all()
        
        # Calculate stats
        stats = {
            'total_suppliers': suppliers.count(),
            'total_airlines': airlines.count(),
            'total_airports': airports.count(),
            'total_transactions': transactions.count(),
            'today_fuel_supplied': float(transactions.filter(
                transaction_date__date=today,
                status='completed'
            ).aggregate(total=Sum('quantity'))['total'] or 0),
            'monthly_revenue': float(transactions.filter(
                transaction_date__date__gte=start_of_month,
                status__in=['completed', 'invoiced']
            ).aggregate(total=Sum('total_amount'))['total'] or 0),
            'monthly_fuel_supplied': float(transactions.filter(
                transaction_date__date__gte=start_of_month,
                status='completed'
            ).aggregate(total=Sum('quantity'))['total'] or 0),
            'pending_transactions': transactions.filter(status='pending').count(),
            'completed_transactions': transactions.filter(status='completed').count(),
            'cancelled_transactions': transactions.filter(status='cancelled').count(),
            'invoiced_transactions': transactions.filter(status='invoiced').count(),
        }
        
        # Fuel type distribution
        fuel_types = transactions.filter(status='completed').values('fuel_type').annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('total_amount')
        )
        stats['fuel_type_distribution'] = [
            {
                'fuel_type': item['fuel_type'],
                'total_quantity': float(item['total_quantity'] or 0),
                'total_revenue': float(item['total_revenue'] or 0)
            }
            for item in fuel_types
        ]
        
        # Top suppliers
        top_suppliers = transactions.filter(status='completed').values(
            'supplier__company_name'
        ).annotate(
            total_fuel=Sum('quantity'),
            total_amount=Sum('total_amount')
        ).order_by('-total_fuel')[:5]
        stats['top_suppliers'] = [
            {
                'supplier__company_name': item['supplier__company_name'],
                'total_fuel': float(item['total_fuel'] or 0),
                'total_amount': float(item['total_amount'] or 0)
            }
            for item in top_suppliers
        ]
        
        # Top airlines
        top_airlines = transactions.filter(status='completed').values(
            'airline__airline_name'
        ).annotate(
            total_fuel=Sum('quantity'),
            total_amount=Sum('total_amount')
        ).order_by('-total_fuel')[:5]
        stats['top_airlines'] = [
            {
                'airline__airline_name': item['airline__airline_name'],
                'total_fuel': float(item['total_fuel'] or 0),
                'total_amount': float(item['total_amount'] or 0)
            }
            for item in top_airlines
        ]
        
        return Response(stats)


class FuelTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'weekly')
        transactions = FuelTransaction.objects.filter(status='completed')
        trends = {}
        
        if period == 'weekly':
            # Last 7 days
            weekly_data = []
            for i in range(6, -1, -1):
                date = timezone.now().date() - timedelta(days=i)
                daily_total = transactions.filter(
                    transaction_date__date=date
                ).aggregate(total=Sum('quantity'))['total'] or 0
                daily_revenue = transactions.filter(
                    transaction_date__date=date
                ).aggregate(total=Sum('total_amount'))['total'] or 0
                weekly_data.append({
                    'date': date.strftime('%a'),
                    'fuel_supplied': float(daily_total),
                    'revenue': float(daily_revenue)
                })
            trends['weekly'] = weekly_data
        
        elif period == 'monthly':
            # Last 30 days
            monthly_data = []
            for i in range(29, -1, -1):
                date = timezone.now().date() - timedelta(days=i)
                daily_total = transactions.filter(
                    transaction_date__date=date
                ).aggregate(total=Sum('quantity'))['total'] or 0
                monthly_data.append({
                    'date': date.strftime('%d %b'),
                    'fuel_supplied': float(daily_total)
                })
            trends['monthly'] = monthly_data
        
        elif period == 'yearly':
            # Last 12 months
            yearly_data = []
            current_year = timezone.now().year
            for month in range(1, 13):
                monthly_total = transactions.filter(
                    transaction_date__year=current_year,
                    transaction_date__month=month
                ).aggregate(total=Sum('quantity'))['total'] or 0
                yearly_data.append({
                    'month': timezone.datetime(current_year, month, 1).strftime('%b'),
                    'fuel_supplied': float(monthly_total)
                })
            trends['yearly'] = yearly_data
        
        return Response(trends)


class RecentActivitiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        
        # Get recent transactions
        transactions = FuelTransaction.objects.select_related(
            'supplier', 'airline', 'airport'
        ).order_by('-transaction_date')[:limit]
        
        activities = []
        for transaction in transactions:
            activities.append({
                'id': str(transaction.id),
                'type': 'transaction',
                'transaction_number': transaction.transaction_number,
                'supplier_name': transaction.supplier.company_name if transaction.supplier else 'N/A',
                'airline_name': transaction.airline.airline_name if transaction.airline else 'N/A',
                'airport_name': transaction.airport.airport_name if transaction.airport else 'N/A',
                'quantity': float(transaction.quantity),
                'total_amount': float(transaction.total_amount),
                'status': transaction.status,
                'timestamp': transaction.transaction_date.isoformat(),
                'icon': 'fuel',
                'color': '#3b82f6'
            })
        
        return Response(activities)