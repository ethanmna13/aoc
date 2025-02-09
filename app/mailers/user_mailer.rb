class UserMailer < ApplicationMailer
  default from: "no-reply@freeeboarding.com"

  def welcome_email(user, password)
    @user = user
    @password = password
    mail(to: @user.email, subject: "Welcome to LiKHA-IT!")
  end
end
