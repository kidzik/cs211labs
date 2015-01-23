from . import ExperimentProcessor

class ExperimentTrainProcessor(ExperimentProcessor):
    def map_results(self, data, profile):
        data = super(ExperimentTrainProcessor, self).parse_json(data)
        profile = super(ExperimentTrainProcessor, self).parse_json(profile)
        results = []

        return results

    def process_results(self, results):
        super(ExperimentTrainProcessor, self).process_results(results)
        processed = {}

        # Format:
        #  - tba
        # Example: "2/errors"
 
        return processed

