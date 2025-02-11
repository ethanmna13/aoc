class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  enum :role, { admin: 0, mentor: 1, mentee: 2 }
  enum :account_status, { inactive: 0, active: 1 }
  validates :role, presence: true
  has_many :mentorships
  has_many :main_tasks, foreign_key: "users_id"
  has_many :sub_tasks, foreign_key: "users_id"
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  before_save :initialize_jti

  def admin?
    role == "admin"
  end

  def initialize_jti
    self.jti ||= SecureRandom.uuid
  end

  def generate_jwt
    payload = { id: id, exp: 1.day.from_now.to_i }
    JWT.encode(payload, ENV["DEVISE_JWT_SECRET_KEY"])
  end

  def jwt_payload
    self.jti = self.class.generate_jti
    self.save
    super.merge({
      jti: self.jti,
      usr: self.id
    })
  end
end
