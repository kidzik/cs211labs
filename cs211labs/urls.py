from django.views.generic import TemplateView, View
from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin
from experiment.views import UserIndexView, SessionView, SessionManagementView, ExperimentView, SubmitResultView, AnalyticsView
from analytics.views import ResultsView, ExportView
from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth.decorators import login_required

admin.autodiscover()

urlpatterns = patterns('',
# experiment view
    url(r'^$', UserIndexView.as_view(), name='start'),
    url(r'^experiment/completed/$', TemplateView.as_view(template_name="experiments/completed.html"), name='completed'),
    url(r'^experiment/$', ExperimentView.as_view(), name='experiment'),

# analytics
    url(r'^result/submit/$', csrf_exempt(SubmitResultView.as_view()), name='submit_result'),
    url(r'^analytics/$', AnalyticsView.as_view(), name='analytics'),

# admin stuff
    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='login'),
                       url(r'^accounts/logout/$', 'django.contrib.auth.views.logout', {'next_page': '/teacher/'}, name='logout'),

    url(r'^teacher/$', login_required(SessionView.as_view()), name='teacher'),
    url(r'^results/(?P<id>\d+)/$', ResultsView.as_view(), name='results'),
    url(r'^results/(?P<id>\d+)/print/$', ResultsView.as_view(), {'print':True}, name='results_print'),
    url(r'^results/(?P<id>\d+)/export/$', login_required(ExportView.as_view()), name='export'),
    url(r'^session/(?P<action>\w+)/(?P<id>\d+)/$', login_required(SessionManagementView.as_view()),
        name='session_management'),


    # url(r'^blog/', include('blog.urls')),
    url(r'^admin/', include(admin.site.urls)),
)

urlpatterns += staticfiles_urlpatterns()
