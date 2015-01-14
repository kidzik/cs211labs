import unittest
from django.test import Client, TestCase
import simplejson

class ExperimentTest(TestCase):
    fixtures = ['initial_data',]

    def setUp(self):
        # Every test needs a client.
        self.client = Client()

    def test_submit_result(self):
        data = [{
                "ordinal": 2,
                "correct": True,
                "consistent": True,
                "color_vis": 'blue',
                "color_tex": 'red',
                "outcome_corr": True,
                "time": 240
            }]

        # Issue a POST request.
        response = self.client.post('/result/submit/', {'user_id': 1, 'data': simplejson.dumps(data)})

        # Check that the response is 200 OK.
        self.assertEqual(response.status_code, 200)

