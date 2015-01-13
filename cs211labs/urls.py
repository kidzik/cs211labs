from django.conf.urls import patterns, include, url

from django.contrib import admin
from experiment.views import UserIndexView, SessionView, ExperimentView

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', UserIndexView.as_view(), name='home'),
    url(r'^teacher/$', SessionView.as_view()),
    url(r'^experiment/(?P<id>\d+)/$', ExperimentView.as_view()),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
