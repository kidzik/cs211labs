from . import ExperimentProcessor

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
            s = s + el['x'] + "/"
            s = s + el['y'] + "/"
            s = s + el['r'] + "/"
            s = s + el['screen_width'] + "/"
            s = s + el['screen_height'] + "/"

            results[s + "time"] = el['time'].__str__()
#            results[s + "time"] = el['time'].__str__()

        return results

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
        processed = {}

        # Format:
        #  - tba
        # Example: "2/errors"
 
        return processed

