from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from transactions.models import FuelTransaction
from suppliers.models import Supplier
from airlines.models import Airline

class DashboardReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        start_of_year = today.replace(month=1, day=1)
        
        # Summary Stats
        total_transactions = FuelTransaction.objects.count()
        completed_transactions = FuelTransaction.objects.filter(status='completed').count()
        total_revenue = FuelTransaction.objects.filter(status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        # Monthly Stats
        monthly_transactions = FuelTransaction.objects.filter(
            transaction_date__date__gte=start_of_month,
            status='completed'
        )
        monthly_revenue = monthly_transactions.aggregate(total=Sum('total_amount'))['total'] or 0
        monthly_fuel = monthly_transactions.aggregate(total=Sum('quantity'))['total'] or 0
        
        # Fuel Type Distribution
        fuel_distribution = FuelTransaction.objects.filter(status='completed').values('fuel_type').annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('total_amount')
        )
        
        # Top Suppliers
        top_suppliers = FuelTransaction.objects.filter(status='completed').values(
            'supplier__company_name'
        ).annotate(
            total_fuel=Sum('quantity'),
            total_revenue=Sum('total_amount')
        ).order_by('-total_revenue')[:5]
        
        # Top Airlines
        top_airlines = FuelTransaction.objects.filter(status='completed').values(
            'airline__airline_name'
        ).annotate(
            total_fuel=Sum('quantity'),
            total_revenue=Sum('total_amount')
        ).order_by('-total_revenue')[:5]
        
        # Monthly Trend (Last 6 months)
        monthly_trend = []
        for i in range(5, -1, -1):
            month_date = today.replace(day=1) - timedelta(days=30*i)
            month_start = month_date.replace(day=1)
            
            if month_date.month == 12:
                month_end = month_date.replace(year=month_date.year+1, month=1, day=1) - timedelta(days=1)
            else:
                month_end = month_date.replace(month=month_date.month+1, day=1) - timedelta(days=1)
            
            month_data = FuelTransaction.objects.filter(
                transaction_date__date__gte=month_start,
                transaction_date__date__lte=month_end,
                status='completed'
            )
            
            monthly_trend.append({
                'month': month_start.strftime('%B %Y'),
                'revenue': float(month_data.aggregate(total=Sum('total_amount'))['total'] or 0),
                'fuel': float(month_data.aggregate(total=Sum('quantity'))['total'] or 0)
            })
        
        return Response({
            'summary': {
                'total_transactions': total_transactions,
                'completed_transactions': completed_transactions,
                'completion_rate': (completed_transactions / total_transactions * 100) if total_transactions > 0 else 0,
                'total_revenue': float(total_revenue),
            },
            'monthly': {
                'revenue': float(monthly_revenue),
                'fuel_supplied': float(monthly_fuel),
                'transactions': monthly_transactions.count(),
            },
            'fuel_distribution': fuel_distribution,
            'top_suppliers': top_suppliers,
            'top_airlines': top_airlines,
            'monthly_trend': monthly_trend,
        })

class RevenueReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date required'}, status=400)
        
        transactions = FuelTransaction.objects.filter(
            transaction_date__date__gte=start_date,
            transaction_date__date__lte=end_date,
            status='completed'
        )
        
        # Daily breakdown
        daily_revenue = transactions.extra(
            select={'date': 'DATE(transaction_date)'}
        ).values('date').annotate(
            revenue=Sum('total_amount'),
            fuel=Sum('quantity')
        ).order_by('date')
        
        return Response({
            'period': {'start': start_date, 'end': end_date},
            'total_revenue': float(transactions.aggregate(total=Sum('total_amount'))['total'] or 0),
            'total_fuel': float(transactions.aggregate(total=Sum('quantity'))['total'] or 0),
            'total_transactions': transactions.count(),
            'daily_breakdown': daily_revenue,
        })