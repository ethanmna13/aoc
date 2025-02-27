require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'Validations' do
    it 'is valid with a valid email, password, and role' do
      user = build(:user)
      expect(user).to be_valid
    end

    it 'is invalid without an email' do
      user = build(:user, email: nil)
      expect(user).to_not be_valid
    end

    it 'is invalid without a password' do
      user = build(:user, password: nil)
      expect(user).to_not be_valid
    end

    it 'is invalid without a role' do
      user = build(:user, role: nil)
      expect(user).to_not be_valid
    end

    it 'is invalid without a name' do
      user = build(:user, name: nil)
      expect(user).to_not be_valid
    end

    it 'is invalid with an invalid email format' do
      user = build(:user, email: 'invalid-email')
      expect(user).to_not be_valid
    end
  end

  describe 'Enums' do
    it 'has a valid role enum' do
      expect(User.roles).to eq({ "admin" => 0, "mentor" => 1, "mentee" => 2 })
    end

    it 'has a valid account_status enum' do
      expect(User.account_statuses).to eq({ "inactive" => 0, "active" => 1 })
    end
  end

  describe 'Methods' do
    let(:user) { create(:user, role: :admin, account_status: :active) }

    it 'returns true if the user is an admin' do
      expect(user.admin?).to eq(true)
    end

    it 'generates a valid JWT token' do
      jwt = user.generate_jwt
      decoded_token = JWT.decode(jwt, ENV["DEVISE_JWT_SECRET_KEY"], true, { algorithm: 'HS256' })
      expect(decoded_token[0]['sub']).to eq(user.id)
    end

    it 'initializes jti before saving' do
      user = build(:user)
      expect(user.jti).to be_nil
      user.save
      expect(user.jti).not_to be_nil
    end

    it 'initializes jti only if it is nil' do
      user = build(:user)
      expect(user.jti).to be_nil

      custom_jti = SecureRandom.uuid
      user.jti = custom_jti
      user.save

      expect(user.jti).to eq(custom_jti)
    end

    describe '#jwt_payload' do
      it 'saves the user and merges jti into the payload' do
        user.jti = nil
        user.save

        payload = user.jwt_payload

        expect(user.reload.jti).not_to be_nil
        expect(payload[:jti]).to eq(user.jti)
        expect(payload[:usr]).to eq(user.id)
      end
    end
  end

  describe 'Associations' do
    it { should have_many(:mentorships_as_mentor).with_foreign_key('mentor_id') }
    it { should have_many(:mentorships_as_mentee).with_foreign_key('mentee_id') }
    it { should have_many(:main_tasks).with_foreign_key('users_id') }
    it { should have_many(:sub_tasks).with_foreign_key('users_id') }
  end

  describe 'Scopes' do
    let!(:admin) { create(:user, role: :admin) }
    let!(:mentor) { create(:user, role: :mentor) }
    let!(:mentee) { create(:user, role: :mentee) }

    it 'returns all admins' do
      expect(User.admins).to include(admin)
      expect(User.admins).not_to include(mentor, mentee)
    end

    it 'returns all mentors' do
      expect(User.mentors).to include(mentor)
      expect(User.mentors).not_to include(admin, mentee)
    end

    it 'returns all mentees' do
      expect(User.mentees).to include(mentee)
      expect(User.mentees).not_to include(admin, mentor)
    end
  end

  describe '.ransackable_associations' do
    it 'returns the correct associations' do
      expect(User.ransackable_associations).to match_array(%w[main_tasks sub_tasks mentorships_as_mentor mentorships_as_mentee])
    end
  end

  describe '.ransackable_attributes' do
    it 'returns the correct attributes' do
      expect(User.ransackable_attributes).to match_array(%w[name email])
    end
  end
end
