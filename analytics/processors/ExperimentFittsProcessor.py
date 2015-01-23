from . import ExperimentProcessor
import re
import math

class ExperimentFittsProcessor(ExperimentProcessor):
    def map_results(self, data, profile):
	"""
        var result = {
	    "ordinal": 3,
	    "x": from -1 to 1,
	    "y": from -1 to 1,
	    "r": from 0.1 to 1,
	    "screen_width": integer,
	    "screen_height": integer,
	    "correct": boolean,
	    "condition": "random" or "deterministic",
	    "time": integer (in ms)
	};
        """
        data = super(ExperimentFittsProcessor, self).parse_json(data)
        profile = super(ExperimentFittsProcessor, self).parse_json(profile)

        results = {}

        for el in data:
            s = ""
            s = s + el['ordinal'].__str__() + "/"
            s = s + ("correct" if el['correct'] else "incorrect") + "/"
            s = s + el['condition'] + "/"
            s = s + el['x'].__str__() + "/"
            s = s + el['y'].__str__() + "/"
            s = s + el['r'].__str__() + "/"
            s = s + el['screen_width'].__str__() + "/"
            s = s + el['screen_height'].__str__() + "/"

            results[s + "time"] = el['time'].__str__()
#            results[s + "time"] = el['time'].__str__()

        return results, profile

    def process_results(self, results):
        """
        Format:
         - experiment in a row 1-5
         - correct / incorrect
         - random / deterministic
         - x
         - y
         - radius
         - screen_width
         - screen_height
         - time
        Example: "2/correct/random/0.21/-0.111/0.23/400/400/time"
        """

        super(ExperimentFittsProcessor, self).process_results(results)

        processed = []

        for condition in ['random','deterministic']:
            regex = "(?P<ordinal>.*)/correct/" + condition + "/(?P<x>.*)/(?P<y>.*)/(?P<radius>.*)/(?P<screen_width>.*)/(?P<screen_height>.*)/(?P<time>.*)"

            res = results.filter(key__iregex=r'^' + regex + '$')

            points_dist = [['distance','time']]
            points_size = [['radius','time']]
            points_fitts = [['fitts','time']]

            reggrp = "(?P<ordinal>.*)/(?P<outcome>.*)/(?P<condition>.*)/(?P<x>.*)/(?P<y>.*)/(?P<radius>.*)/(?P<screen_width>.*)/(?P<screen_height>.*)/(?P<time>.*)"
            R = re.compile(reggrp)

            print res 

            for r in res:
                G = R.search(r.key)
                x = float(G.group('x'))
                y = float(G.group('y'))
                radius = float(G.group('radius'))

                dist = math.sqrt(x*x + y*y)
                time = int(r.value)

                p = [dist, time]
                points_dist.append(p)

                p = [radius, time]
                points_size.append(p)

                p = [math.log(dist * 2 / radius), time]
                points_fitts.append(p)

            processed.append({'data': points_dist, 'title': condition + " condition: distance / time", 'type': 'scatter'})
            processed.append({'data': points_size, 'title': condition + " condition: radius / time", 'type': 'scatter'})
            processed.append({'data': points_fitts, 'title': condition + " condition: fitts / time", 'type': 'scatter'})
 
 
        return processed

