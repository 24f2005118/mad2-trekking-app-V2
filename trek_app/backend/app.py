from flask import Flask, request, make_response
from config import Config
from models import db
from flask_jwt_extended import JWTManager

jwt = JWTManager()


def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin']  = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response


def handle_options_requests():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin']  = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    jwt.init_app(app)
    app.before_request(handle_options_requests)
    app.after_request(add_cors_headers)

    from routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
