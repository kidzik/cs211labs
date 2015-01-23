from django.views.generic import TemplateView, View
from experiment.forms import UserForm, SessionForm
from django.views.generic.edit import FormView
from experiment.models import Session, User, Result
from django.shortcuts import redirect
from analytics.views import EXPERIMENT_CLASSES
from django.http import HttpResponse

class UserIndexView(FormView):
    """
    Default page seen by the user. Form to create the
    experiment instance within the session
    """
    template_name = 'user_index.html'
    form_class = UserForm
    success_url = '/experiment/'

    def form_valid(self, form):
        form.instance.completed = False
        form.save()
        self.request.session["user_id"] = form.instance.id
        return super(UserIndexView, self).form_valid(form)

class SessionView(FormView):
    """
    Teachers page. Form for session creation and list of current sessions
    """
    template_name = "teacher_index.html"
    form_class = SessionForm
    success_url = '/'

    def get_context_data(self, **kwargs):
        context = super(SessionView, self).get_context_data(**kwargs)
        context['sessions'] = Session.objects.all()
        return context

    def form_valid(self, form):
        form.instance.closed = False
        form.save()
        return super(SessionView, self).form_valid(form)

class ExperimentView(TemplateView):
    """
    View for all experiments. Shows the html template corresponding to
    the session of the user. User id is taken from the HTTP session.

    TODO: It would be nice if it autodetected the experiment from user id
    """
    def get_context_data(self, *args, **kwargs):
        context = super(ExperimentView, self).get_context_data(**kwargs)
        context['user_id'] = self.request.session["user_id"]
        return context

    def get_template_names(self):
        u = User.objects.get(id = self.request.session["user_id"])
        return ["experiments/" + u.session.experiment.slug + ".html"]

class SubmitResultView(View):
    """
    Result submission view. Parses given json and saves it in the database.
    Parsing is done by an adequate ExperimentProcessor class.
    """    
    def post(self, request):
        uid = request.POST['user_id']
        u = User.objects.get(id = uid)

        ep = EXPERIMENT_CLASSES[u.session.experiment.slug]()
        data = request.POST['data']
        user_profile = request.POST['user_profile']

        parsed, profile = ep.map_results(data, user_profile)

        for key, val in parsed.iteritems():
            r = Result()
            r.user = u
            r.key = key
            r.value = val
            r.save()

        u.completed = True
        u.profile = user_profile
        u.save()

        return HttpResponse('result')

class SessionManagementView(View):
    """
    Opens or closes a session
    """    
    def get(self, *args, **kwargs):
        s = Session.objects.get(id=self.kwargs['id'])
        if self.kwargs['action'] == "open":
            s.closed = False
        if self.kwargs['action'] == "close":
            s.closed = True
        s.save()
        return redirect('teacher')

