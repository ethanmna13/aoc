class Api::V1::AssignedSubTasksController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin
end
