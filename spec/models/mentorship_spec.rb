require 'rails_helper'

RSpec.describe Mentorship, type: :model do
  describe 'Validations' do
    let(:mentor) { create(:user, role: :mentor) }
    let(:mentee) { create(:user, role: :mentee) }

    it 'is valid with a mentor_id and mentee_id' do
      mentorship = build(:mentorship, mentor_id: mentor.id, mentee_id: mentee.id)
      expect(mentorship).to be_valid
    end

    it 'is invalid without a mentor_id' do
      mentorship = build(:mentorship, mentor_id: nil, mentee_id: mentee.id)
      expect(mentorship).to_not be_valid
      expect(mentorship.errors[:mentor_id]).to include("can't be blank")
    end

    it 'is invalid without a mentee_id' do
      mentorship = build(:mentorship, mentor_id: mentor.id, mentee_id: nil)
      expect(mentorship).to_not be_valid
      expect(mentorship.errors[:mentee_id]).to include("can't be blank")
    end
  end

  describe 'Associations' do
    it { should have_many(:assigned_main_task).with_foreign_key('mentorships_id') }
    it { should have_many(:assigned_sub_task).with_foreign_key('mentorships_id') }
  end

  describe 'Ransackable Attributes' do
    it 'returns the correct ransackable attributes' do
      expect(Mentorship.ransackable_attributes).to match_array(%w[created_at updated_at mentor_id])
    end
  end

  describe 'Ransackable Associations' do
    it 'returns the correct ransackable associations' do
      expect(Mentorship.ransackable_associations).to match_array(%w[mentor mentee])
    end
  end
end
