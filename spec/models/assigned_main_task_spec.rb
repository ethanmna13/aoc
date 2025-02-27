require 'rails_helper'

RSpec.describe AssignedMainTask, type: :model do
  describe 'Validations' do
    let(:mentorship) { create(:mentorship) }
    let(:main_task) { create(:main_task) }

    it 'is valid with a mentorships_id, main_tasks_id, and status' do
      assigned_main_task = build(:assigned_main_task, mentorships_id: mentorship.id, main_tasks_id: main_task.id, status: :not_started)
      expect(assigned_main_task).to be_valid
    end

    it 'is invalid without a mentorships_id' do
      assigned_main_task = build(:assigned_main_task, mentorships_id: nil, main_tasks_id: main_task.id, status: :not_started)
      expect(assigned_main_task).to_not be_valid
      expect(assigned_main_task.errors[:mentorships_id]).to include("can't be blank")
    end

    it 'is invalid without a main_tasks_id' do
      assigned_main_task = build(:assigned_main_task, mentorships_id: mentorship.id, main_tasks_id: nil, status: :not_started)
      expect(assigned_main_task).to_not be_valid
      expect(assigned_main_task.errors[:main_tasks_id]).to include("can't be blank")
    end

    it 'is invalid without a status' do
      assigned_main_task = build(:assigned_main_task, mentorships_id: mentorship.id, main_tasks_id: main_task.id, status: nil)
      expect(assigned_main_task).to_not be_valid
      expect(assigned_main_task.errors[:status]).to include("can't be blank")
    end
  end

  describe 'Associations' do
    it { should belong_to(:mentorship).class_name('Mentorship').with_foreign_key('mentorships_id') }
    it { should belong_to(:main_task).class_name('MainTask').with_foreign_key('main_tasks_id') }
    it { should have_many(:assigned_sub_task).with_foreign_key('assigned_main_tasks_id').dependent(:destroy) }
    it { should have_many_attached(:submissions) }
  end

  describe 'Enums' do
    it 'defines the correct status enum' do
      expect(AssignedMainTask.statuses).to eq({ "not_started" => 0, "in_progress" => 1, "completed" => 2 })
    end
  end

  describe 'Ransackable Attributes' do
    it 'returns the correct ransackable attributes' do
      expect(AssignedMainTask.ransackable_attributes).to match_array(%w[id mentorships_id main_tasks_id status])
    end
  end

  describe 'Ransackable Associations' do
    it 'returns the correct ransackable associations' do
      expect(AssignedMainTask.ransackable_associations).to match_array(%w[mentorship main_task])
    end
  end
end
