from . import ExperimentProcessor

class ExperimentDualProcessor(ExperimentProcessor):
    def map_results(self, data, profile):
        data = super(ExperimentDualProcessor, self).parse_json(data)
        profile = super(ExperimentDualProcessor, self).parse_json(profile)
        results = []

        return results

    def process_results(self, results):
        super(ExperimentDualProcessor, self).process_results(results)
        processed = {}

        # Format:
        #  - tba
        # Example: "2/errors"
 
        return processed

