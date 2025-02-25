# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# User.create!([
#    { name: "Ethan", email: "mina-ethanchristian@c-fo.com", password: "1234abcd", role: 0, account_status: 1 },
#    { name: "Christian", email: "ethanchristianm@gmail.com", password: "1234abcd", role: 2, account_status: 1 },
#   { name: "Dren", email: "dren@gmail.com", password: "1234abcd", role: 1, account_status: 1 },
#   { name: "Ly", email: "ly@gmail.com", password: "1234abcd", role: 1, account_status: 1 },
#  { name: "Diana", email: "diana@gmail.com", password: "1234abcd", role: 2, account_status: 1 }
#  ])

require 'securerandom'

admin_email = "spongebob@gmail.com"
admin_name = "Spongebob"
password = "1234abcd"

admin = User.create!(
  email: admin_email,
  name: admin_name,
  role: :admin,
  account_status: :active,
  password: password,
  password_confirmation: password
)

jwt_token = admin.generate_jwt
