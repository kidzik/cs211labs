from django.shortcuts import render
from django.views.generic import View, TemplateView

# Create your views here.
class ResultsView(TemplateView):
    def get(self, request, *args, **kwargs):
        context = {}
        return render(request, "results.html", context)
