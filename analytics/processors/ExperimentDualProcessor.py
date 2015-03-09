from . import ExperimentProcessor
import math

class ExperimentDualProcessor(ExperimentProcessor):
    def map_results(self, data, profile):
# {'user_id': 1,
# 'user_profile': {
#   "device_id": "LT"|"LM"|"T"|"P",
#   "condition": "A"|"B", //A=stable symmetry, increasing ball; B=increasing symmetry, stable ball
#   "baseline_ball": 33, //Number of completed ball tasks in the last 30s of the single-task period
#   "baseline_sym": 22 //Number of completed symmetry tasks in the last 30s of the single-task period
# },
# 'data': [{
#   "ordinal": 2, //zero-based, counting only the dual-task period
#   "outcome_ball_corr": true,
#   "outcome_sym_corr": true,
#   "time_ball": 240,
#   "time_sym": 360,
#   "complexity_ball": 13,
#   "complexity_sym": 12
# }, ...
# ]}
        data = super(ExperimentDualProcessor, self).parse_json(data)
        profile = super(ExperimentDualProcessor, self).parse_json(profile)
        print profile
        results = {}

        for el in data:
            s = ""
            s = s + ("ball" if profile['condition'] == "A" else "symmetry") + "/"
            s = s + el['ordinal'].__str__() + "/"
            s = s + el['complexity_ball'].__str__() + "/"
            s = s + (math.floor(el['complexity_sym'])).__str__() + "/"

            results[s + "error_ball"] = 0 if el['outcome_ball_corr'] else 1
            results[s + "error_sym"] = 0 if el['outcome_sym_corr'] else 1
            results[s + "time_ball"] = el['time_ball'].__str__()
            results[s + "time_sym"] = el['time_sym'].__str__()

        return results, profile

    # Big mess. Don't try to go through it. Better see ExperimentProcessor.get_data
    def get_data2d(self, results, nvars, dep1, dep2, levels1, levels2, scaling = 1):
        resd = {}
        datas = []
        for interface in levels1:
            exps = self.gen_reg_exp(nvars-1, dep1, levels2)
            data = []
            for key, val in exps.iteritems():
                valint = val + "/" + interface
                res = results.filter(key__iregex=r'^' + valint + '$')
                v = self.mean_values(res) * scaling
                data.append([int(float(key)), v])
            datas.append(data)

        for v in datas[0]:
            resd[v[0]] = []

        for data in datas:
            for v in data:
                resd[v[0]].append(v[1])

        res = []
        for i,v in datas[0]:
            res.append([i] + resd[i])
        return res

    def process_results(self, results):
        super(ExperimentDualProcessor, self).process_results(results)
        processed = []

        # Format:
        #  - ordinal/complexity_ball/complexity_sym
        # Example:
        #    1/12/1/error_ball -> 0

        r = [i.__str__() + ".0" for i in range(1,7)]
        
        res_sym = results.filter(key__iregex=r'^symmetry/')

        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "Symmetry errors", 'type': "number"},{'id': "value", 'label': "Ball errors", 'type': "number"}],]
#        data = self.get_data(res_sym, "error_sym", 4, 3, r)
        data = self.get_data2d(res_sym, 5, 3, 4, ["error_sym", "error_ball"], r)
        data.sort()
        processed.append({'data': header + data, 'title': 'Symmetry condition: Errors vs difficulty', 'var': 'Errors in time', 'type': 'line'})
 
        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "Symmetry time", 'type': "number"},{'id': "value", 'label': "Ball time", 'type': "number"}],]
#        data = self.get_data(res_sym, "error_sym", 4, 3, r)
        data = self.get_data2d(res_sym, 5, 3, 4, ["time_sym", "time_ball"], r, scaling=0.001)
        data.sort()
        processed.append({'data': header + data, 'title': 'Symmetry condition: Time vs difficulty', 'var': 'Errors in time', 'type': 'line'})
 

        res_ball = results.filter(key__iregex=r'^ball/')

        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "Symmetry errors", 'type': "number"},{'id': "value", 'label': "Ball errors", 'type': "number"}],]
#        data = self.get_data(res_sym, "error_sym", 4, 3, r)
        data = self.get_data2d(res_ball, 5, 2, 4, ["error_sym", "error_ball"], range(1,20))
        data.sort()
        processed.append({'data': header + data, 'title': 'Ball condition: Errors vs difficulty', 'var': 'Errors in time', 'type': 'line'})
 
        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "Symmetry time", 'type': "number"},{'id': "value", 'label': "Ball time", 'type': "number"}],]
#        data = self.get_data(res_sym, "error_sym", 4, 3, r)
        data = self.get_data2d(res_ball, 5, 2, 4, ["time_sym", "time_ball"], range(1,20), scaling=0.001)
        data.sort()
        processed.append({'data': header + data, 'title': 'Ball condition: Errors vs time', 'var': 'Errors in time', 'type': 'line'})

        return processed

