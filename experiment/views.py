# some_app/views.py
from django.views.generic import TemplateView, View
from experiment.forms import UserForm, SessionForm
from django.views.generic.edit import FormView
from experiment.models import Session

class UserIndexView(FormView):
    template_name = 'user_index.html'
    form_class = UserForm
    success_url = '/experiment/'

    def form_valid(self, form):
        form.save()
        self.success_url = self.success_url + form.instance.session.experiment.id.__str__() + '/'
        return super(UserIndexView, self).form_valid(form)

class SessionView(FormView):
    template_name = "teacher_index.html"
    form_class = SessionForm

    def get_context_data(self, **kwargs):
        context = super(SessionView, self).get_context_data(**kwargs)
        context['sessions'] = Session.objects.all()
        return context

    def form_valid(self, form):
        form.instance.closed = False
        form.save()
        return super(SessionView, self).form_valid(form)

class ExperimentView(TemplateView):
    def get_template_names(self):
        return ["experiments/" + self.kwargs['id'] + ".html"]
