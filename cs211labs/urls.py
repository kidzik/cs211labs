from django.conf.urls import patterns, include, url

from django.contrib import admin
from experiment.views import UserIndexView, SessionView, SessionManagementView, ExperimentView
from analytics.views import ResultsView

from django.contrib.auth.decorators import login_required

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', UserIndexView.as_view(), name='start'),
    url(r'^experiment/(?P<id>\d+)/$', ExperimentView.as_view(), name='experiment'),

    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='login'),
                       url(r'^accounts/logout/$', 'django.contrib.auth.views.logout', {'next_page': '/teacher/'}, name='logout'),
    url(r'^teacher/$', login_required(SessionView.as_view()), name='teacher'),
    url(r'^results/(?P<id>\d+)/$', login_required(ResultsView.as_view()), name='results'),
    url(r'^session/(?P<action>\w+)/(?P<id>\d+)/$', login_required(SessionManagementView.as_view()),
        name='session_management'),

    url(r'^acco$', UserIndexView.as_view(), name='start'),


    # url(r'^blog/', include('blog.urls')),
    # url(r'^admin/', include(admin.site.urls)),
)
