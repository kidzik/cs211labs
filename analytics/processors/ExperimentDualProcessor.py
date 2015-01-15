from . import ExperimentProcessor

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

