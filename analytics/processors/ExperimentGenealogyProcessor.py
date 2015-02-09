from . import ExperimentProcessor

class ExperimentGenealogyProcessor(ExperimentProcessor):
    def map_results(self, data, profile):
        """
        {
            "ordinal": integer,
            "num_elements": integer,
            "outcome_corr": boolean,
            "time": integer (in ms)
        }
        """

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
        processed = []

        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "value", 'type': "number"}],]

        data = self.get_data(results, "errors", 1, 0, range(8))
        data.sort()
        processed.append({'data': header + data, 'title': 'Errors in time', 'var': 'Errors in time', 'type': 'line'})

#        data = self.get_data(results, "noresp", 1, 0, range(8))
#        data.sort()
#        processed.append({'data': header + data, 'title': 'No responses in time', 'var': 'no responses in time', 'type': 'line'})
        
        data = self.get_data(results, "time", 1, 0, range(8),scaling = 0.001)
        data.sort()
        processed.append({'data': header + data, 'title': 'Response time', 'var': 'Response time', 'type': 'line'})
 
        return processed

