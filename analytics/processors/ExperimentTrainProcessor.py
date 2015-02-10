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
            s = s + el['sub_ordinal'].__str__() + "/"
            s = s + el['interface'] + "/"
#            s = s + ("colorblind" if profile['colorblind'] else "notcolorblind") + "/"
            results[s + "errors"] = 0 if el['outcome_corr'] else 1
            results[s + "help"] = el['help']
            results[s + "time"] = el['time'].__str__()

        return results, profile

    # Big mess. Don't try to go through it. Better see ExperimentProcessor.get_data
    def get_data2d(self, results, var, nvars, dep1, dep2, levels1, levels2, scaling = 1):
        resd = {}
        datas = []
        for interface in levels1:
            exps = self.gen_reg_exp(nvars-1, dep2-1, levels2)
            data = []
            for key, val in exps.iteritems():
                valint = val + "/" + interface
                res = results.filter(key__iregex=r'^' + valint + '/' + var + '$')
                v = self.mean_values(res) * scaling
                data.append([key, v])
            datas.append(data)

        for v in datas[0]:
            resd[v[0]] = []

        for data in datas:
            for v in data:
                resd[v[0]].append(v[1])

        res = []
        for i in range(len(datas[0])):
            res.append([i] + resd[i])
        return res

    def process_results(self, results):
        super(ExperimentTrainProcessor, self).process_results(results)
        processed = []
        interfaces = ["command", "graphical", "form", "dragdrop"]

        data = self.get_data(results, "errors", 3, 0, range(20))
        data.sort()

        # all interfaces
        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "value", 'type': "number"}],]

        processed.append({'data': header + data, 'title': "Mean errors throughout the study", 'var': "Mean errors", 'type': 'line'})

        data = self.get_data(results, "time", 3, 0, range(20), scaling = 0.001)
        data.sort()
        processed.append({'data': header + data, 'title': "Mean time per try", 'var': "Mean time", 'type': 'line'})

        # per interface
        header = [["time"] + interfaces]
        data = self.get_data2d(results, "errors", 3, 1, 2, interfaces, range(5), scaling = 1)
        data.sort()
        processed.append({'data': header + data, 'title': "Mean errors per try for each interface", 'var': "Mean errors", 'type': 'line'})

        header = [["time"] + interfaces]
        data = self.get_data2d(results, "time", 3, 1, 2, interfaces, range(5), scaling = 1)
        data.sort()
        processed.append({'data': header + data, 'title': "Mean time per try for each interface", 'var': "Mean time", 'type': 'line'})



        processed.append({'data': self.get_data(results, "time", 3, 2, interfaces, scaling = 0.001), 'title': "Mean time per interface", 'var': "Mean time", 'type': 'barplot'})

        processed.append({'data': self.get_data(results, "errors", 3, 2, interfaces), 'title': "Mean errors per interface", 'var': "Mean errors", 'type': 'barplot'})

        processed.append({'data': self.get_data(results, "help", 3, 2, interfaces), 'title': "Mean help requests per interface", 'var': "Mean help requests", 'type': 'barplot'})

    
        return processed

