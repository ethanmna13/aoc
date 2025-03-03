class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  enum :role, { admin: 0, mentor: 1, mentee: 2 }
  enum :account_status, { inactive: 0, active: 1 }
  validates :role, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP, message: "is not a valid email" }
  validates :name, presence: true

  has_many :main_tasks, foreign_key: "users_id"
  has_many :sub_tasks, foreign_key: "users_id"
  has_many :mentorships_as_mentor, class_name: "Mentorship", foreign_key: "mentor_id"
  has_many :mentorships_as_mentee, class_name: "Mentorship", foreign_key: "mentee_id"

  scope :admins, -> { where(role: "admin") }
  scope :mentors, -> { where(role: "mentor") }
  scope :mentees, -> { where(role: "mentee") }

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  before_save :initialize_jti

  def initialize_jti
    self.jti ||= SecureRandom.uuid
  end

  def generate_jwt
    payload = {
      sub: id,
      name: name,
      role: role,
      account_status: account_status,
      jti: self.jti,
      exp: 1.day.from_now.to_i
    }
    JWT.encode(payload, ENV["DEVISE_JWT_SECRET_KEY"], "HS256")
  end

  def jwt_payload
    self.jti ||= SecureRandom.uuid
    self.save
    super.merge({
      jti: self.jti,
      usr: self.id
    })
  end

  def revoke_jwt
    self.update(jti: SecureRandom.uuid)
  end

  def self.ransackable_associations(auth_object = nil)
    %w[main_tasks sub_tasks mentorships_as_mentor mentorships_as_mentee]
  end

  def self.ransackable_attributes(auth_object = nil)
    %w[name email]
  end
end
