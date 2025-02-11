class ApplicationController < ActionController::Base
  protect_from_forgery unless: -> { request.format.json? }

  before_action :authenticate_user!, unless: -> { request.format.json? }
  before_action :authenticate_api_v1_user!, if: -> { request.format.json? }
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
end
