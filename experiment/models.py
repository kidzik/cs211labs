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
    time = models.DateTimeField(auto_now_add=True)
    closed = models.BooleanField()

    def __str__(self):
        return self.experiment.slug.__str__() + "-" + self.course.__str__()

    def num_students(self):
        return self.user_set.all().count()

    def num_students_completed(self):
        return self.user_set.filter(completed=1).count()

class User(models.Model):
    session = models.ForeignKey(Session)
    profile = models.CharField(max_length=1024)
    completed = models.BooleanField()
    def __str__(self):
        return self.id.__str__()

class Result(models.Model):
    user = models.ForeignKey(User)
    key = models.CharField(max_length=255)
    value = models.CharField(max_length=50)    

    def __str__(self):
        return "%s: %s -> %s" % (self.user.__str__(), self.key.__str__(), self.value.__str__())
