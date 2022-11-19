var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var timer = require('timers/promises');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

app.get('/users/:id', async (req, res, next) => {
  await timer.setTimeout(2000);
  const con = new UserController(new UserInteractor(new UserRepository(), new UserPresenter(res)));
  con.getUser({id: Number(req.params.id)});
});

app.get('/api/users/:id', (req, res, next) => {
  const con = new UserController(new UserInteractor(new UserRepository(), new JSONUserPresenter(res)));
  con.getUser({id: Number(req.params.id)});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

class UserController {
  constructor(interactor) {
    this.interactor = interactor;
  }

  getUser(input) {
    this.interactor.handle(input);
  }
}

class UserInteractor {
  constructor(repository, presenter) {
    this.repository = repository;
    this.presenter = presenter;
  }

  handle(input) {
    const repoData = this.repository.getById(input.id);
    const outputData = repoData;
    this.presenter.complete(outputData);
  }
}

class UserRepository {
  constructor() {
  }

  getById(id) {
    if (id === 1) {
      return {
        name: "soup"
      }
    }

    return {
      name: "John"
    }
  }
}

class UserPresenter {
  constructor(res) {
    this.res = res;
  }

  complete(output) {
    const viewModel = new UserViewModel(output);
    this.res.render('user', viewModel);
  }
}

class JSONUserPresenter {
  constructor(res) {
    this.res = res;
  }

  complete(output) {
    const viewModel = new UserViewModel(output);
    this.res.send(viewModel);
  }
}

class UserViewModel {
  constructor(output) {
    this.name = `${output.name}さん`;
  }
}
