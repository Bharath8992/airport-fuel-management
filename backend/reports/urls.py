from django.urls import path
from .views import DashboardReportView, RevenueReportView

urlpatterns = [
    path('dashboard/', DashboardReportView.as_view(), name='dashboard-report'),
    path('revenue/', RevenueReportView.as_view(), name='revenue-report'),
]