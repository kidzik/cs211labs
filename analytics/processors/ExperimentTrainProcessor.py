from . import ExperimentProcessor

class ExperimentTrainProcessor(ExperimentProcessor):
    def map_results(self, data, profile):
        # Format: list of
        # {
        #   "ordinal": current_task,
        #   "interface": get_current_interface(),
        #   "outcome_corr": current_task_success,
        #   "help": help_hits,
        #   "time": (current_task_elapsed_time - total_help_time)
        # }

        data = super(ExperimentTrainProcessor, self).parse_json(data)
        profile = super(ExperimentTrainProcessor, self).parse_json(profile)

        results = {}

        for el in data:
            s = ""
            s = s + el['ordinal'].__str__() + "/"
            s = s + ("correct" if el['correct'] else "incorrect") + "/"
            s = s + ("consistent" if el['consistent'] else "inconsistent") + "/"
            s = s + el['color_tex'] + "/"
            s = s + el['color_vis'] + "/"
#            s = s + ("colorblind" if profile['colorblind'] else "notcolorblind") + "/"
            results[s + "errors"] = 0 if el['outcome_corr'] else 1
            results[s + "time"] = el['time'].__str__()

        return results, profile


    def process_results(self, results):
        super(ExperimentTrainProcessor, self).process_results(results)
        processed = {}

        # Format:
        #  - tba
        # Example: "2/errors"
 
        return processed

