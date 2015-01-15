from . import ExperimentProcessor

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

