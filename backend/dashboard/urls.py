# dashboard/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('fuel-trends/', views.FuelTrendsView.as_view(), name='fuel-trends'),
    path('recent-activities/', views.RecentActivitiesView.as_view(), name='recent-activities'),
]