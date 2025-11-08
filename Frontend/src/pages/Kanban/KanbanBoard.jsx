import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, X, Calendar, User, Tag, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const KanbanBoard = () => {
  const { projectId, boardId } = useParams();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [columns, setColumns] = useState([
    { id: 'todo', name: 'To Do', cards: [] },
    { id: 'inprogress', name: 'In Progress', cards: [] },
    { id: 'done', name: 'Done', cards: [] },
  ]);
  const [draggedCard, setDraggedCard] = useState(null);
  const [showNewCardModal, setShowNewCardModal] = useState(null);

  useEffect(() => {
    if (boardId && projectId) {
      fetchBoard();
      fetchProjectMembers();
    }
  }, [boardId, projectId]);

  const fetchProjectMembers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PROJECT_BY_ID(projectId), {
        withCredentials: true,
      });
      const project = response.data.project;
      setProjectMembers(project.members || []);
    } catch (error) {
      console.error('Failed to fetch project members:', error);
    }
  };

  const fetchBoard = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.BOARD_BY_ID(boardId), {
        withCredentials: true,
      });

      const boardData = response.data.board;
      setBoard(boardData);

      // Organize cards by column
      const cardsResponse = await axios.get(
        `${API_ENDPOINTS.CARDS}/board/${boardId}`,
        { withCredentials: true }
      );

      const cards = cardsResponse.data.cards || [];
      const updatedColumns = columns.map((col) => ({
        ...col,
        cards: cards.filter((card) => card.column === col.id),
      }));

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Failed to fetch board:', error);
    }
  };

  const handleDragStart = (card, columnId) => {
    setDraggedCard({ card, sourceColumnId: columnId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetColumnId) => {
    if (!draggedCard) return;

    const { card, sourceColumnId } = draggedCard;

    if (sourceColumnId === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    try {
      // Update card column on backend
      await axios.put(
        API_ENDPOINTS.CARD_BY_ID(card._id),
        { column: targetColumnId },
        { withCredentials: true }
      );

      // Update local state
      const updatedColumns = columns.map((col) => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c._id !== card._id),
          };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            cards: [...col.cards, { ...card, column: targetColumnId }],
          };
        }
        return col;
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Failed to move card:', error);
    }

    setDraggedCard(null);
  };

  const createCard = async (columnId, cardData) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.CARDS,
        {
          board: boardId,
          column: columnId,
          ...cardData,
        },
        { withCredentials: true }
      );

      const newCard = response.data.card;

      const updatedColumns = columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [...col.cards, newCard],
          };
        }
        return col;
      });

      setColumns(updatedColumns);
      setShowNewCardModal(null);
    } catch (error) {
      console.error('Failed to create card:', error);
      alert('Failed to create card: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteCard = async (cardId, columnId) => {
    try {
      await axios.delete(API_ENDPOINTS.CARD_BY_ID(cardId), {
        withCredentials: true,
      });

      const updatedColumns = columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c._id !== cardId),
          };
        }
        return col;
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-16 z-30 border-b ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } px-6 py-4`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="btn-ghost p-2"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">{board.name}</h1>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`w-80 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              } p-4`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  {column.name}
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    {column.cards.length}
                  </span>
                </h2>
                <button
                  onClick={() => setShowNewCardModal(column.id)}
                  className="btn-ghost p-1"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {column.cards.map((card) => (
                  <div
                    key={card._id}
                    draggable
                    onDragStart={() => handleDragStart(card, column.id)}
                    className={`kanban-card group relative ${
                      draggedCard?.card._id === card._id ? 'opacity-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => deleteCard(card._id, column.id)}
                      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white"
                    >
                      <X size={14} />
                    </button>

                    <h3 className="font-semibold mb-2">{card.title}</h3>

                    {card.description && (
                      <p
                        className={`text-sm mb-3 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {card.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {card.labels?.map((label, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 rounded bg-blue-500 text-white"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      {card.assignee && (
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {(card.assignee.name || card.assignee).charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={isDark ? 'text-gray-400' : 'text-gray-600'}
                          >
                            {card.assignee.name || card.assignee}
                          </span>
                        </div>
                      )}

                      {card.dueDate && (
                        <div
                          className={`flex items-center gap-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <Calendar size={14} />
                          <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {column.cards.length === 0 && (
                  <p
                    className={`text-center py-8 text-sm ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    No cards yet
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Card Modal */}
      {showNewCardModal && (
        <NewCardModal
          columnId={showNewCardModal}
          onClose={() => setShowNewCardModal(null)}
          onCreate={createCard}
          isDark={isDark}
          projectMembers={projectMembers}
        />
      )}
    </div>
  );
};

// New Card Modal Component
const NewCardModal = ({ columnId, onClose, onCreate, isDark, projectMembers }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    labels: [],
  });
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const filteredMembers = projectMembers.filter((member) =>
    member.user.name.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  const handleAssigneeSelect = (memberId, memberName) => {
    setFormData({ ...formData, assignee: memberId });
    setAssigneeSearch(memberName);
    setShowMemberDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title) {
      onCreate(columnId, formData);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Create New Card</h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Card title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="input-field resize-none"
              placeholder="Card description"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">Assignee</label>
            <div className="relative">
              <input
                type="text"
                value={assigneeSearch}
                onChange={(e) => {
                  setAssigneeSearch(e.target.value);
                  setShowMemberDropdown(true);
                }}
                onFocus={() => setShowMemberDropdown(true)}
                className="input-field pr-10"
                placeholder="Search team members with @"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            {showMemberDropdown && filteredMembers.length > 0 && (
              <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg border max-h-48 overflow-y-auto ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                {filteredMembers.map((member) => (
                  <button
                    key={member.user._id}
                    type="button"
                    onClick={() => handleAssigneeSelect(member.user._id, member.user.name)}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                      isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-xs text-gray-500">{member.user.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KanbanBoard;
