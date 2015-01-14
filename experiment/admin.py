from django.contrib import admin
from experiment.models import *

class UserAdmin(admin.ModelAdmin):
    pass
class CourseAdmin(admin.ModelAdmin):
    pass
class ExperimentAdmin(admin.ModelAdmin):
    pass
class SessionAdmin(admin.ModelAdmin):
    pass
class ResultAdmin(admin.ModelAdmin):
    pass

admin.site.register(Result, ResultAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Experiment, ExperimentAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Session, SessionAdmin)
