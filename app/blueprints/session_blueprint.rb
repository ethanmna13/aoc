class SessionBlueprint < Blueprinter::Base
  fields :id, :email, :name, :role, :account_status, :jti
end
