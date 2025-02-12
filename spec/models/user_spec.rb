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
  end

  describe 'Associations' do
    # it { should have_many(:mentorships) }
    it { should have_many(:main_tasks).with_foreign_key('users_id') }
    it { should have_many(:sub_tasks).with_foreign_key('users_id') }
  end
end
