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
            s = s + el['interface'] + "/"
#            s = s + ("colorblind" if profile['colorblind'] else "notcolorblind") + "/"
            results[s + "errors"] = 0 if el['outcome_corr'] else 1
            results[s + "help"] = el['help']
            results[s + "time"] = el['time'].__str__()

        return results, profile


    def process_results(self, results):
        super(ExperimentTrainProcessor, self).process_results(results)
        processed = []

        data = self.get_data(results, "errors", 2, 0, range(5))
        data.sort()

        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "value", 'type': "number"}],]

        processed.append({'data': header + data, 'title': "Mean errors per try", 'var': "Mean errors", 'type': 'line'})

        data = self.get_data(results, "time", 2, 0, range(5), scaling = 0.001)
        data.sort()
        processed.append({'data': header + data, 'title': "Mean time per try", 'var': "Mean time", 'type': 'line'})


        processed.append({'data': self.get_data(results, "time", 2, 1, ["command", "graphical", "form", "dragdrop"], scaling = 0.001), 'title': "Mean time per interface", 'var': "Mean time", 'type': 'barplot'})

        processed.append({'data': self.get_data(results, "errors", 2, 1, ["command", "graphical", "form", "dragdrop"]), 'title': "Mean errors per interface", 'var': "Mean errors", 'type': 'barplot'})

        processed.append({'data': self.get_data(results, "help", 2, 1, ["command", "graphical", "form", "dragdrop"]), 'title': "Mean help requests per interface", 'var': "Mean help requests", 'type': 'barplot'})

    
        return processed

