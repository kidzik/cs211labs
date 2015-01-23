from . import ExperimentProcessor

class ExperimentGenealogyProcessor(ExperimentProcessor):
    def map_results(self, data, profile):
        # Format: list of
        # {
        #  "ordinal": 2,
        #  "resp": true,
        #  "outcome_corr": true,
        #  "time": 240
        # }

        data = super(ExperimentGenealogyProcessor, self).parse_json(data)
        profile = super(ExperimentGenealogyProcessor, self).parse_json(profile)

        results = {}

        for el in data:
            s = ""
            s = s + el['ordinal'].__str__() + "/"

            results[s + "noresp"] = 1 if el['resp'] else 0
            results[s + "errors"] = 0 if el['outcome_corr'] else 1
            results[s + "time"] = el['time'].__str__()

        return results, profile

    def process_results(self, results):
        # Format:
        #  - experiment in a row 0-7
        #  - noresp / errors / time
        # Example: "2/noresp"
 
        super(ExperimentGenealogyProcessor, self).process_results(results)
        processed = {}

        processed["errors"] = {'data': self.get_data(results, "errors", 1, 0, range(8)), 'title': 'Errors in time', 'var': 'Errors in time'}
        processed["noresp"] = {'data': self.get_data(results, "noresp", 1, 0, range(8)), 'title': 'No responses in time', 'var': 'no responses in time'}
        processed["time"] = {'data': self.get_data(results, "time", 1, 0, range(8)), 'title': 'Response time', 'var': 'Response time'}
 
        return processed

