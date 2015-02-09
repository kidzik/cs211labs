import simplejson

class ExperimentProcessor(object):
    """
    A base class for each experiment processor.
    Experiment's processor job is to map the json recieved from the HTML
    experiment into key -> value tuples format. Then, this tuples are saved
    in the database.
    The second job is to analyse key -> value tuples and output the results
    for charts in the analytics module
    """

    def process_results(self, data):
        pass

    def parse_json(self, data):
        return simplejson.loads(data)

    def map_results(self, data, profile):
        pass

    def mean_values(self, results):
        s = 0
        n = 0
        for res in results:
            n = n + 1
            s = s + int(res.value)
        if n == 0:
            return 0
        return float(s)/float(n)

    # generates regular expression */*/level[
    def gen_reg_exp(self, nvars, dep, levels):
        s = r""
        res = {}
        for level in levels:
            for i in range(nvars):
                if i == dep:
                    s = s + level.__str__()
                else:
                    s = s + r"[0-9a-zA-Z]+"
                if i < nvars - 1:
                    s = s + r"/"
            res[level] = s
            s = ""
        return res

    # Split the set of results by variable dep
    # and given levels
    # Since keys are in the format v1/v2/v3/v4/v5/...
    # we take all results which fit */*/level[0]/*/*
    # into group 0, then all */*/level[1]/*/* to group 1 etc
    def get_data(self, results, var, nvars, dep, levels, scaling = 1):
        exps = self.gen_reg_exp(nvars, dep, levels)
        data = []
        print exps
        for key, val in exps.iteritems():
            res = results.filter(key__iregex=r'^' + val + '/' + var + '$')
            v = self.mean_values(res) * scaling
            data.append([key, v])
        return data

