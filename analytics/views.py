from django.shortcuts import render
from django.views.generic import View, TemplateView
from experiment.models import *
from analytics.processors import *
import simplejson
import csv
from django.http import HttpResponse

EXPERIMENT_CLASSES = {
    "CS211-1-TRAIN": ExperimentTrainProcessor,
    "CS211-2-STROOP": ExperimentSTROOPProcessor,
    "CS211-3-GENEALOGY": ExperimentGenealogyProcessor,
    "CS211-4-DUAL": ExperimentDualProcessor,
    "CS211-5-FITT": ExperimentFittsProcessor
}

class ResultsView(TemplateView):
    """
    Converts tuples of the given experiment into aggregated
    results which are then shown on the analytics page
    """
    def get(self, request, *args, **kwargs):
        session = Session.objects.get(id = kwargs['id'])
        results = Result.objects.filter(user__in = session.user_set.all())

        # Ugly but dynamic...
        ep = EXPERIMENT_CLASSES[session.experiment.slug]()

        processed_results = ep.process_results(results)

        context = {"results": processed_results, "session": session}

        if kwargs.has_key('print') and kwargs['print']:
            context['print'] = True
        return render(request, "analytics/generic.html", context)

class ExportView(TemplateView):
    """
    Converts tuples of the given experiment into a csv table
    """
    def get(self, request, *args, **kwargs):
        session = Session.objects.get(id = kwargs['id'])
        results = Result.objects.filter(user__in = session.user_set.all())

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="session' + kwargs['id'] + '.csv"'

        writer = csv.writer(response)
        for result in results:
            s = (result.key + "/" + result.value).split('/')
            writer.writerow(s)

        return response
