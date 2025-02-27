require 'rails_helper'

RSpec.describe AssignedSubTask, type: :model do
  describe 'Validations' do
    let(:mentorship) { create(:mentorship) }
    let(:assigned_main_task) { create(:assigned_main_task) }
    let(:sub_task) { create(:sub_task) }

    it 'is valid with a mentorships_id, assigned_main_tasks_id, sub_task_id, and status' do
      assigned_sub_task = build(:assigned_sub_task, mentorships_id: mentorship.id, assigned_main_tasks_id: assigned_main_task.id, sub_task_id: sub_task.id, status: :not_started)
      expect(assigned_sub_task).to be_valid
    end

    it 'is invalid without a mentorships_id' do
      assigned_sub_task = build(:assigned_sub_task, mentorships_id: nil, assigned_main_tasks_id: assigned_main_task.id, sub_task_id: sub_task.id, status: :not_started)
      expect(assigned_sub_task).to_not be_valid
      expect(assigned_sub_task.errors[:mentorships_id]).to include("can't be blank")
    end

    it 'is invalid without an assigned_main_tasks_id' do
      assigned_sub_task = build(:assigned_sub_task, mentorships_id: mentorship.id, assigned_main_tasks_id: nil, sub_task_id: sub_task.id, status: :not_started)
      expect(assigned_sub_task).to_not be_valid
      expect(assigned_sub_task.errors[:assigned_main_tasks_id]).to include("can't be blank")
    end

    it 'is invalid without a sub_task_id' do
      assigned_sub_task = build(:assigned_sub_task, mentorships_id: mentorship.id, assigned_main_tasks_id: assigned_main_task.id, sub_task_id: nil, status: :not_started)
      expect(assigned_sub_task).to_not be_valid
      expect(assigned_sub_task.errors[:sub_task_id]).to include("can't be blank")
    end

    it 'is invalid without a status' do
      assigned_sub_task = build(:assigned_sub_task, mentorships_id: mentorship.id, assigned_main_tasks_id: assigned_main_task.id, sub_task_id: sub_task.id, status: nil)
      expect(assigned_sub_task).to_not be_valid
      expect(assigned_sub_task.errors[:status]).to include("can't be blank")
    end
  end

  describe 'Associations' do
    it { should belong_to(:mentorship).class_name('Mentorship').with_foreign_key('mentorships_id') }
    it { should belong_to(:assigned_main_task).class_name('AssignedMainTask').with_foreign_key('assigned_main_tasks_id') }
    it { should belong_to(:sub_task).class_name('SubTask').with_foreign_key('sub_task_id') }
    it { should have_many_attached(:submissions) }
  end

  describe 'Enums' do
    it 'defines the correct status enum' do
      expect(AssignedSubTask.statuses).to eq({ "not_started" => 0, "in_progress" => 1, "completed" => 2 })
    end
  end

  describe 'Ransackable Attributes' do
    it 'returns the correct ransackable attributes' do
      expect(AssignedSubTask.ransackable_attributes).to match_array(%w[id sub_tasks_id mentorships_id status created_at updated_at assigned_main_tasks_id])
    end
  end

  describe 'Ransackable Associations' do
    it 'returns the correct ransackable associations' do
      expect(AssignedSubTask.ransackable_associations).to match_array(%w[mentorship sub_task assigned_main_task])
    end
  end
end
