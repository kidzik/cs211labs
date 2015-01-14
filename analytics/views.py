from django.shortcuts import render
from django.views.generic import View, TemplateView
from experiment.models import *
from analytics.processors.ExperimentProcessor import ExperimentProcessor
import simplejson

class ExperimentTrainProcessor(ExperimentProcessor):
    def parse_json(self, data):
        data = super(ExperimentSTROOPProcessor, self).parse_json(data)
        results = []

        return results

    def process_results(self, results):
        super(ExperimentSTROOPProcessor, self).process_results(results)
        processed = {}

        # Format:
        #  - tba
        # Example: "2/errors"
 
        return processed

class ExperimentSTROOPProcessor(ExperimentProcessor):
    def parse_json(self, data):
        # Format: list of
        # {
        #  "ordinal": 2,
        #  "correct": true,
        #  "consistent": true,
        #  "color_vis": 'blue',
        #  "color_tex": 'red',
        #  "outcome_corr": true,
        #  "time": 240
        # }

        data = super(ExperimentSTROOPProcessor, self).parse_json(data)

        results = {}

        for el in data:
            s = ""
            s = s + el['ordinal'].__str__() + "/"
            s = s + ("c" if el['correct'] else "i") + "/"
            s = s + ("c" if el['consistent'] else "i") + "/"
            s = s + el['color_tex'] + "/"
            s = s + el['color_vis'] + "/"
            results[s + "errors"] = 0 if el['outcome_corr'] else 1
            results[s + "time"] = el['time'].__str__()

        return results

    def process_results(self, results):
        # Format:
        #  - experiment in a row 1-5
        #  - correct / incorrect
        #  - consistent / inconsistent
        #  - text color
        #  - semantic color
        #  - errors / time
        # Example: "2/correct/inconsistent/red/yellow/errors"
 
        super(ExperimentSTROOPProcessor, self).process_results(results)
        processed = []

        processed.append({'data': self.get_data(results, "errors", 5, 2, ["consistent","inconsistent"]), 'title': "Mean errors per mode", 'var': "Mean errors"})
        processed.append({'data': self.get_data(results, "time", 5, 2, ["consistent","inconsistent"]), 'title': "Mean response time per mode", 'var': "Mean response time"})
        processed.append({'data': self.get_data(results, "errors", 5, 3, ["red","blue","green","yellow","brown"]), 'title': "Mean errors per text color", 'var': "Mean errors"})
        processed.append({'data': self.get_data(results, "errors", 5, 4, ["red","blue","green","yellow","brown"]), 'title': "Mean errors per text semantics", 'var': "Mean errors"})
 
        return processed

class ExperimentGenealogyProcessor(ExperimentProcessor):
    def parse_json(self, data):
        # Format: list of
        # {
        #  "ordinal": 2,
        #  "resp": true,
        #  "outcome_corr": true,
        #  "time": 240
        # }

        data = super(ExperimentGenealogyProcessor, self).parse_json(data)

        results = {}

        for el in data:
            s = ""
            s = s + el['ordinal'].__str__() + "/"

            results[s + "noresp"] = 1 if el['resp'] else 0
            results[s + "errors"] = 0 if el['outcome_corr'] else 1
            results[s + "time"] = el['time'].__str__()

        return results

    def process_results(self, results):
        # Format:
        #  - experiment in a row 0-7
        #  - noresp / errors / time
        # Example: "2/noresp"
 
        super(ExperimentSTROOPProcessor, self).process_results(results)
        processed = {}

        processed["errors"] = {'data': self.get_data(results, "errors", 1, 0, range(8)), 'title': 'Errors in time', 'var': 'Errors in time'}
        processed["noresp"] = {'data': self.get_data(results, "noresp", 1, 0, range(8)), 'title': 'No responses in time', 'var': 'no responses in time'}
        processed["time"] = {'data': self.get_data(results, "time", 1, 0, range(8)), 'title': 'Response time', 'var': 'Response time'}
 
        return processed

class ExperimentDualProcessor(ExperimentProcessor):
    def parse_json(self, data):
        data =super(ExperimentSTROOPProcessor, self).parse_json(data)
        results = []

        return results

    def process_results(self, results):
        super(ExperimentSTROOPProcessor, self).process_results(results)
        processed = {}

        # Format:
        #  - tba
        # Example: "2/errors"
 
        return processed

class ExperimentFittsProcessor(ExperimentProcessor):
    def parse_json(self, data):
        data =super(ExperimentSTROOPProcessor, self).parse_json(data)
        results = []

        return results

    def process_results(self, results):
        super(ExperimentSTROOPProcessor, self).process_results(results)
        processed = {}

        # Format:
        #  - tba
        # Example: "2/errors"
 
        return processed

EXPERIMENT_CLASSES = {
    "CS211-1-TRAIN": ExperimentTrainProcessor,
    "CS211-2-STROOP": ExperimentSTROOPProcessor,
    "CS211-3-GENEALOGY": ExperimentGenealogyProcessor,
    "CS211-4-DUAL": ExperimentDualProcessor,
    "CS211-5-FITTS": ExperimentFittsProcessor
}

# Create your views here.
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
        return render(request, "results/generic.html", context)

