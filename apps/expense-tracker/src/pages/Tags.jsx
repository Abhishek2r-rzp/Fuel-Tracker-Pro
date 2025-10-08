import { useState, useEffect } from "react";
import { useAuth } from "@bill-reader/shared-auth";
import { Plus, Tag, Edit2, Trash2, Save, X } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui";
import {
  createTag,
  getUserTags,
  updateTag,
  deleteTag,
  PRESET_TAGS,
} from "../services/tagService";

const COLOR_OPTIONS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
];

const EMOJI_OPTIONS = [
  "🏷️",
  "👨‍👩‍👧‍👦",
  "🛒",
  "💼",
  "👤",
  "🏠",
  "✈️",
  "🏥",
  "📚",
  "🎮",
  "💰",
  "🎁",
  "❤️",
  "🚨",
  "🍔",
  "🚗",
  "📱",
  "🏃",
  "💪",
  "🎵",
];

export default function Tags() {
  const { currentUser } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#9333EA",
    icon: "🏷️",
    description: "",
  });

  useEffect(() => {
    if (currentUser) {
      fetchTags();
    }
  }, [currentUser]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const userTags = await getUserTags(currentUser.uid);
      setTags(userTags);
    } catch (_error) {
      alert("Failed to fetch tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a tag name");
      return;
    }

    try {
      await createTag(currentUser.uid, formData);
      await fetchTags();
      setShowCreateForm(false);
      setFormData({
        name: "",
        color: "#9333EA",
        icon: "🏷️",
        description: "",
      });
    } catch (_error) {
      alert("Failed to create tag. Please try again.");
    }
  };

  const handleUpdate = async (tagId) => {
    try {
      await updateTag(tagId, formData);
      await fetchTags();
      setEditingId(null);
      setFormData({
        name: "",
        color: "#9333EA",
        icon: "🏷️",
        description: "",
      });
    } catch (_error) {
      alert("Failed to update tag. Please try again.");
    }
  };

  const handleDelete = async (tagId, tagName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${tagName}"? This will remove the tag from all transactions.`
    );

    if (!confirmed) return;

    try {
      await deleteTag(tagId);
      await fetchTags();
    } catch (_error) {
      alert("Failed to delete tag. Please try again.");
    }
  };

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      color: tag.color,
      icon: tag.icon,
      description: tag.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      color: "#9333EA",
      icon: "🏷️",
      description: "",
    });
  };

  const createPresetTag = async (preset) => {
    try {
      await createTag(currentUser.uid, preset);
      await fetchTags();
    } catch (_error) {
      alert("Failed to create preset tag. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tags & Labels
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your transactions with custom tags
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Tag
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Tag</CardTitle>
            <CardDescription>
              Add a custom tag to organize your transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Family, Work, Grocery"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                        formData.icon === emoji
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? "border-gray-900 dark:border-white scale-110"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g., Expenses related to family"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Create Tag
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tags.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Tags Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first tag to start organizing transactions
            </p>
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Start: Add Preset Tags
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {PRESET_TAGS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => createPresetTag(preset)}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                    style={{ borderColor: preset.color }}
                  >
                    <span>{preset.icon}</span>
                    <span className="text-sm font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tags.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardContent className="p-4">
                {editingId === tag.id ? (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <div className="flex flex-wrap gap-1">
                      {EMOJI_OPTIONS.slice(0, 10).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, icon: emoji })
                          }
                          className={`w-8 h-8 rounded border ${
                            formData.icon === emoji
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(tag.id)}>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${tag.color}20` }}
                        >
                          {tag.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {tag.name}
                          </h3>
                          {tag.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {tag.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(tag)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(tag.id, tag.name)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Preset Tags</CardTitle>
            <CardDescription>
              Add commonly used tags with one click
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.filter(
                (preset) => !tags.some((tag) => tag.name === preset.name)
              ).map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => createPresetTag(preset)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  style={{ borderColor: preset.color }}
                >
                  <span>{preset.icon}</span>
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
