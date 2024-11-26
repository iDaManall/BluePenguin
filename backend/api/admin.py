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

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_suspended', 'suspension_strikes')
    list_filter = ('is_suspended',)
    actions = ['reactivate_accounts']

    def reactivate_accounts(self, request, queryset):
        for account in queryset:
            account.is_suspended = False
            account.save()

            user = account.user
            EmailNotifications.notify_account_reactivated(user)

@admin.register(UserApplication)
class UserApplicationAdmin(admin.ModelAdmin):
    list_display = ('account', 'status', 'captcha_completed', 'time_of_application')
    list_filter = ('status', 'captcha_completed')
    actions = ['approve_applications', 'reject_applications']

    def approve_applications(self, request, queryset):
        for application in queryset:
            application.status = REQUEST_APPROVED_CHOICE
            application.save()
            
            account = application.account
            account.status = STATUS_USER
            account.save()

            EmailNotifications.notify_user_application_approved(account.user)

    def reject_applications(self, request, queryset):
        for application in queryset:
            application.status = REQUEST_REJECTED_CHOICE
            application.save()
            EmailNotifications.notify_user_application_rejected(application.account.user)

