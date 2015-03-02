from . import ExperimentProcessor

class ExperimentSTROOPProcessor(ExperimentProcessor):
    def map_results(self, data, profile):
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
        profile = super(ExperimentSTROOPProcessor, self).parse_json(profile)

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

        print datas
        print resd
        res = []
        for dt in datas[0]:
            res.append([dt[0]] + resd[dt[0]])
        return res

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

        processed.append({'data': self.get_data(results, "errors", 5, 2, ["consistent","inconsistent"]), 'title': "Mean errors per mode", 'var': "Mean errors", 'type': 'barplot'})

        processed.append({'data': self.get_data(results, "time", 5, 2, ["consistent","inconsistent"]), 'title': "Mean response time per mode", 'var': "Mean response time", 'type': 'barplot'})
        processed.append({'data': self.get_data(results, "errors", 5, 3, ["red","blue","green","yellow","brown"]), 'title': "Mean errors per text color", 'var': "Mean errors", 'type': 'barplot'})
        processed.append({'data': self.get_data(results, "errors", 5, 4, ["red","blue","green","yellow","brown"]), 'title': "Mean errors per text semantics", 'var': "Mean errors", 'type': 'barplot'})
 
        colors = ["blue", "brown", "green", "yellow", "red"]
        header = [[""] + colors]
        data = self.get_data2d(results, "errors", 5, 3, 4, colors, colors, scaling = 1)
        data.sort()
        processed.append({'data': header + data, 'title': "Mean errors per text color / semantic color", 'var': "Mean errors", 'type': 'table'})


        return processed

