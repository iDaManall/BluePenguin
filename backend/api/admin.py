from django.contrib import admin
from .models import *
from .choices import *
from .utils import EmailNotifications

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'reportee', 'status')
    list_filter = ('status',)
    actions = ['approve_reports', 'reject_reports']

    def approve_reports(self, request, queryset):
        for report in queryset:
            report.status = REQUEST_APPROVED_CHOICE
            report.save()

            reportee_user = report.reportee.account.user
            EmailNotifications.notify_reported(reportee_user, report.report)

    def reject_reports(self, request, queryset):
        for report in queryset:
            report.status = REQUEST_REJECTED_CHOICE
            report.save()

            reportee_user = report.reportee.account.user
            EmailNotifications.notify_report_rejected(reportee_user)

@admin.register(QuitRequest)
class QuitRequestAdmin(admin.ModelAdmin):
    list_display = ('account', 'status')
    list_filter = ('status',)
    actions = ['approve_reports', 'reject_reports']

    def approve_deletions(self, request, queryset):
        for deletion_request in queryset:
            deletion_request.status = REQUEST_APPROVED_CHOICE
            deletion_request.save()

            account = deletion_request.account
            user = account.user
            EmailNotifications.notify_deletion_approved(user)
            account.delete_account_user_profile()

    def reject_deletions(self, request, queryset):
        for deletion_request in queryset:
            deletion_request.status = REQUEST_REJECTED_CHOICE
            deletion_request.save()

            user = deletion_request.account.user
            EmailNotifications.notify_deletion_rejected(user)
