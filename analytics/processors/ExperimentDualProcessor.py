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

    def process_results(self, results):
        super(ExperimentDualProcessor, self).process_results(results)
        processed = []

        # Format:
        #  - ordinal/complexity_ball/complexity_sym
        # Example:
        #    1/12/1/error_ball -> 0
        
        res_sym = results.filter(key__iregex=r'^symmetry/')

        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "value", 'type': "number"}],]
        r = [i.__str__() + ".0" for i in range(1,7)]
        data = self.get_data(res_sym, "error_sym", 4, 3, r)
        data.sort()
        processed.append({'data': header + data, 'title': 'Errors in the symmetry task vs difficulty', 'var': 'Errors in time', 'type': 'line'})
 
        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "value", 'type': "number"}],]
        data = self.get_data(res_sym, "time_sym", 4, 3, r, scaling=0.001)
        data.sort()
        processed.append({'data': header + data, 'title': 'Time of symmetry task vs difficulty', 'var': 'Errors in time', 'type': 'line'})
 

        res_ball = results.filter(key__iregex=r'^ball/')
        print res_ball

        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "value", 'type': "number"}],]
        data = self.get_data(res_ball, "error_ball", 4, 2, range(1,20))
        data.sort()
        processed.append({'data': header + data, 'title': 'Errors in ball task vs difficulty', 'var': 'Errors in time', 'type': 'line'})
 
        header = [[{'id': "time", 'label': "time", 'type': "number"},{'id': "value", 'label': "value", 'type': "number"}],]
        data = self.get_data(res_ball, "time_ball", 4, 2, range(1,20), scaling=0.001)
        data.sort()
        
        processed.append({'data': header + data, 'title': 'Time of ball task vs difficulty', 'var': 'Errors in time', 'type': 'line'})
 
        return processed

