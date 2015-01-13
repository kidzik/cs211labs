from django.db import models

class Experiment(models.Model):
    slug = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name.__str__()

class Course(models.Model):
    slug = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name.__str__()

class Session(models.Model):
    experiment = models.ForeignKey(Experiment)
    course = models.ForeignKey(Course)
    time = models.TimeField(auto_now_add=True)
    closed = models.BooleanField()

    def __str__(self):
        return self.experiment.slug.__str__() + "-" + self.course.__str__()

    def students(self):
        return self.user_set.all().count()

class User(models.Model):
    session = models.ForeignKey(Session)
    device = models.CharField(max_length=50)
    
class Result(models.Model):
    user = models.ForeignKey(User)
    mode = models.IntegerField()
    key = models.CharField(max_length=50)
    value = models.CharField(max_length=50)    
