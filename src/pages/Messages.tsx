import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, MoreVertical, Phone, Video, Paperclip, FileText, Trash2, X, Reply, ChevronRight, Filter, Pin, CheckSquare, User, Archive, Ban, Star, Inbox, MailOpen, Flag, AlertTriangle, MessageCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import MessageBubble from "@/components/MessageBubble";
import CreateOfferModal from "@/components/CreateOfferModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "@/hooks/use-toast";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { EmptyState } from "@/components/ui/empty-state";

interface Conversation {
  id: number;
  user: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online: boolean;
  lastSeen?: string;
}

interface Message {
  id: number;
  sender: "user" | "other";
  content: string;
  time: string;
  image?: string;
  status?: "sent" | "delivered" | "seen";
  dateLabel?: string;
  replyTo?: {
    content: string;
    sender: string;
  };
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    user: "Sarah Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMessage: "Hey! How's your project going?",
    time: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    user: "Mike Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    lastMessage: "Thanks for the help yesterday!",
    time: "1h ago",
    online: false,
    lastSeen: "Last seen 2 minutes ago",
  },
  {
    id: 3,
    user: "Emma Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    lastMessage: "Let's catch up this weekend",
    time: "3h ago",
    online: true,
  },
  {
    id: 4,
    user: "Jake Cooper",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jake",
    lastMessage: "Check out this link!",
    time: "5h ago",
    online: false,
    lastSeen: "Offline",
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "other",
    content: "Hey! How's your project going?",
    time: "10:30 AM",
    dateLabel: "Today",
  },
  {
    id: 2,
    sender: "user",
    content: "It's going great! Just finished the main features.",
    time: "10:32 AM",
    status: "seen",
  },
  {
    id: 3,
    sender: "other",
    content: "That's awesome! Would love to see it when you're ready.",
    time: "10:33 AM",
  },
  {
    id: 4,
    sender: "user",
    content: "Sure! I'll share the demo link soon.",
    time: "10:35 AM",
    status: "delivered",
  },
];

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const [messageInput, setMessageInput] = useState("");
  const [showConversationList, setShowConversationList] = useState(true);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "archived" | "unread" | "favorites">("all");
  const [pinned, setPinned] = useState<number[]>([]);
  const [archived, setArchived] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [blocked, setBlocked] = useState<number[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [msgSelectMode, setMsgSelectMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<number[]>([]);
  const [showDeleteMsgOptions, setShowDeleteMsgOptions] = useState(false);
  const { clearUnread } = useUnreadMessages();

  const exitMsgSelect = () => { setMsgSelectMode(false); setSelectedMsgIds([]); setShowDeleteMsgOptions(false); };

  const toggleMsgSelect = (id: number) => {
    setSelectedMsgIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const deleteSelectedMessages = (scope: "everyone" | "me") => {
    setMessages(prev => prev.filter(m => !selectedMsgIds.includes(m.id)));
    toast({ title: scope === "everyone" ? "Deleted for everyone" : "Deleted for you" });
    exitMsgSelect();
  };

  const toggleIn = (list: number[], setList: (v: number[]) => void, id: number) => {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const applyToSelected = (fn: (id: number) => void) => {
    selectedIds.forEach(fn);
    setSelectedIds([]);
    setSelectMode(false);
  };

  const exitSelect = () => { setSelectMode(false); setSelectedIds([]); };

  // Clear unread count when user opens messages page
  useEffect(() => {
    clearUnread();
  }, [clearUnread]);

  // Open (or create) a chat when arriving with ?user=Name&avatar=...
  useEffect(() => {
    const name = searchParams.get("user");
    if (!name) return;
    const avatar = searchParams.get("avatar") || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    let targetId = 0;
    setConversations(prev => {
      const existing = prev.find(c => c.user.toLowerCase() === name.toLowerCase());
      if (existing) {
        targetId = existing.id;
        return prev;
      }
      const created: Conversation = {
        id: Date.now(),
        user: name,
        avatar,
        lastMessage: "Say hi 👋",
        time: "now",
        online: true,
      };
      targetId = created.id;
      setMessages([]);
      return [created, ...prev];
    });
    setSelectedConversation(targetId);
    setShowConversationList(false);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "user",
        content: messageInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "sent",
        ...(replyingTo && {
          replyTo: {
            content: replyingTo.content,
            sender: replyingTo.sender === "user" ? "You" : conversations.find(c => c.id === selectedConversation)?.user || "User"
          }
        })
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageInput("");
      setReplyingTo(null);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };



  const handleDeleteConversation = (ids?: number[]) => {
    const targets = ids && ids.length ? ids : selectedIds;
    if (!targets.length) return;
    setConversations(prev => {
      const next = prev.filter(c => !targets.includes(c.id));
      if (targets.includes(selectedConversation) && next.length) setSelectedConversation(next[0].id);
      return next;
    });
    toast({ title: targets.length > 1 ? `${targets.length} chats deleted` : "Chat deleted" });
  };

  const handleClearChat = () => {
    toast({ title: "Chat cleared" });
  };

  const selectedUser = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      
      <main className={`flex-1 pt-14 md:pt-14 ${showConversationList ? 'pb-16' : 'pb-0'} md:pb-8 flex overflow-hidden`}>
        <div className={`${showConversationList ? 'h-[calc(100dvh-8rem)]' : 'h-[calc(100dvh-3.5rem)]'} md:h-[calc(100dvh-4rem)] flex w-full overflow-hidden`}>

          {/* Conversations List */}
          <div
            className={`${
              showConversationList ? "flex" : "hidden"
            } md:flex w-full md:w-80 flex-col border-r border-border bg-card`}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold gradient-text">
                  {selectMode ? `${selectedIds.length} selected` : "Messages"}
                </h2>
                <div className="flex items-center gap-1">
                  {selectMode && (
                    <Button variant="ghost" size="icon" aria-label="Cancel selection" onClick={exitSelect}>
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                  {!selectMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Filter conversations">
                          <Filter className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setActiveFilter("all")}>
                          <Inbox className="w-4 h-4 mr-2" /> All
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveFilter("archived")}>
                          <Archive className="w-4 h-4 mr-2" /> Archived
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveFilter("unread")}>
                          <MailOpen className="w-4 h-4 mr-2" /> Unread
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveFilter("favorites")}>
                          <Star className="w-4 h-4 mr-2" /> Favorites
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {selectMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Selection actions" disabled={selectedIds.length === 0}>
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => applyToSelected(id => toggleIn(pinned, setPinned, id))}>
                          <Pin className="w-4 h-4 mr-2" /> Pin / Unpin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedIds(conversations.map(c => c.id))}>
                          <CheckSquare className="w-4 h-4 mr-2" /> Select All
                        </DropdownMenuItem>
                        {selectedIds.length === 1 && (
                          <DropdownMenuItem onClick={() => { navigate(`/profile/${selectedIds[0]}`); exitSelect(); }}>
                            <User className="w-4 h-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => applyToSelected(id => toggleIn(archived, setArchived, id))}>
                          <Archive className="w-4 h-4 mr-2" /> Archive / Unarchive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => applyToSelected(id => toggleIn(favorites, setFavorites, id))}>
                          <Star className="w-4 h-4 mr-2" /> Add to Favorites
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => { applyToSelected(id => toggleIn(blocked, setBlocked, id)); toast({ title: "Blocked" }); }}
                        >
                          <Ban className="w-4 h-4 mr-2" /> Block
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => { handleDeleteConversation(selectedIds); exitSelect(); }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
              {activeFilter !== "all" && (
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">Filter: {activeFilter}</span>
                  <button onClick={() => setActiveFilter("all")} className="text-primary">Clear</button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations
                  .filter(c => {
                    if (activeFilter === "archived") return archived.includes(c.id);
                    if (activeFilter === "unread") return !!c.unread;
                    if (activeFilter === "favorites") return favorites.includes(c.id);
                    return !archived.includes(c.id);
                  })
                  .sort((a, b) => (pinned.includes(b.id) ? 1 : 0) - (pinned.includes(a.id) ? 1 : 0))
                  .map((conversation) => {
                  const isSelected = selectedIds.includes(conversation.id);
                  let pressTimer: ReturnType<typeof setTimeout> | null = null;
                  const startPress = () => {
                    pressTimer = setTimeout(() => {
                      setSelectMode(true);
                      setSelectedIds(prev => prev.includes(conversation.id) ? prev : [...prev, conversation.id]);
                    }, 450);
                  };
                  const cancelPress = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };
                  return (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onPointerDown={startPress}
                    onPointerUp={cancelPress}
                    onPointerLeave={cancelPress}
                    onPointerCancel={cancelPress}
                    onContextMenu={(e) => { e.preventDefault(); setSelectMode(true); setSelectedIds(prev => prev.includes(conversation.id) ? prev : [...prev, conversation.id]); }}
                    onClick={() => {
                      if (selectMode) {
                        toggleIn(selectedIds, setSelectedIds, conversation.id);
                      } else {
                        setSelectedConversation(conversation.id);
                        setShowConversationList(false);
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                      isSelected
                        ? "bg-primary/15 ring-1 ring-primary/40"
                        : selectedConversation === conversation.id && !selectMode
                          ? "bg-muted"
                          : "hover:bg-muted/50"
                    }`}
                  >
                    {selectMode && (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                        {isSelected && <CheckSquare className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    )}
                    <div className="relative shrink-0"><Avatar className="w-12 h-12"><AvatarImage src={conversation.avatar} /><AvatarFallback>{conversation.user[0]}</AvatarFallback></Avatar><span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card ${conversation.online ? "bg-green-500" : "bg-muted-foreground"}`} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate flex items-center gap-1">
                          {pinned.includes(conversation.id) && <Pin className="w-3 h-3 text-primary" />}
                          {conversation.user}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread && (
                          <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
                {conversations.filter(c => activeFilter === "archived" ? archived.includes(c.id) : activeFilter === "unread" ? !!c.unread : activeFilter === "favorites" ? favorites.includes(c.id) : !archived.includes(c.id)).length === 0 && (
                  <EmptyState className="py-10" icon={MessageCircle} title="No conversations yet" description="Start chatting with people after connecting with them." actionLabel="Explore Users" onAction={() => navigate("/people-suggestions")} />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={`${
              showConversationList ? "hidden" : "flex"
            } md:flex flex-1 flex-col bg-background`}
          >
            {/* Chat Header */}
            {msgSelectMode ? (
              <div className="p-4 border-b border-border bg-card flex items-center justify-between sticky top-0 z-10">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  Delete {selectedMsgIds.length > 0 ? `(${selectedMsgIds.length}) ` : ""}message{selectedMsgIds.length === 1 ? "" : "s"} ?
                </h3>
                <Button variant="ghost" size="icon" aria-label="Cancel message selection" onClick={exitMsgSelect}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
            <div className="p-4 border-b border-border bg-card flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowConversationList(true)}
                >
                  <span className="text-xl">←</span>
                </Button>
                <div className="relative"><Avatar className="w-10 h-10"><AvatarImage src={selectedUser?.avatar} /><AvatarFallback>{selectedUser?.user[0]}</AvatarFallback></Avatar><span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${selectedUser?.online ? "bg-green-500" : "bg-muted-foreground"}`} /></div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {selectedUser?.user}
                  </h3>
                   <p className="text-xs text-muted-foreground">{selectedUser?.online ? "Online" : selectedUser?.lastSeen || "Offline"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Chat options">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => toast({ title: "Chat reported", description: "Thanks, our team will review it." })}>
                      <Flag className="w-4 h-4 mr-2" /> Report Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => { toggleIn(blocked, setBlocked, selectedConversation); toast({ title: "User blocked" }); }}
                    >
                      <Ban className="w-4 h-4 mr-2" /> Block
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setMsgSelectMode(true); setSelectedMsgIds([]); }}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => { handleDeleteConversation([selectedConversation]); setShowConversationList(true); }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Chat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toast({ title: "Technical problem reported", description: "We'll look into it shortly." })}>
                      <AlertTriangle className="w-4 h-4 mr-2" /> Report Technical Problem
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.dateLabel && <div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs font-medium text-muted-foreground">{message.dateLabel}</span><div className="h-px flex-1 bg-border" /></div>}
                    {msgSelectMode ? (
                      <button
                        type="button"
                        onClick={() => toggleMsgSelect(message.id)}
                        aria-pressed={selectedMsgIds.includes(message.id)}
                        className={`w-full flex items-start gap-2 rounded-2xl p-1 text-left transition-colors ${selectedMsgIds.includes(message.id) ? "bg-primary/10" : "hover:bg-muted/50"}`}
                      >
                        <span className={`mt-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${selectedMsgIds.includes(message.id) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                          {selectedMsgIds.includes(message.id) && <CheckSquare className="h-3 w-3" />}
                        </span>
                        <span className="flex-1 pointer-events-none">
                          <MessageBubble message={message} onReply={handleReply} />
                        </span>
                      </button>
                    ) : (
                      <MessageBubble message={message} onReply={handleReply} />
                    )}
                  </div>
                ))}
                {!msgSelectMode && selectedUser?.online && <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground"><span>{selectedUser.user} is typing</span><span className="flex gap-1" aria-label="Typing"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" /></span></div>}
              </div>
            </ScrollArea>

            {/* Delete messages action bar */}
            {msgSelectMode && (
              <div className="border-t border-border bg-card p-3 sm:p-4">
                <div className="max-w-3xl mx-auto">
                  {showDeleteMsgOptions ? (
                    <div className="space-y-2">
                      <Button variant="destructive" className="w-full" onClick={() => deleteSelectedMessages("everyone")}>
                        Delete for everyone
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => deleteSelectedMessages("me")}>
                        Delete for you
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={() => setShowDeleteMsgOptions(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={selectedMsgIds.length === 0}
                      onClick={() => setShowDeleteMsgOptions(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete{selectedMsgIds.length ? ` (${selectedMsgIds.length})` : ""}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Reply Preview */}
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border bg-muted/50 px-4 py-2"
                >
                  <div className="flex items-center justify-between max-w-3xl mx-auto">
                    <div className="flex items-center gap-2">
                      <Reply className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium text-primary">
                          Replying to {replyingTo.sender === "user" ? "yourself" : selectedUser?.user}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {replyingTo.content}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setReplyingTo(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <motion.button
                  type="button"
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
                  animate={{ rotate: showMediaOptions ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                <AnimatePresence>
                  {showMediaOptions && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1 overflow-hidden flex-shrink-0"
                    >
                       <label className="cursor-pointer flex-shrink-0">
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; setMessages(prev => [...prev, { id: Date.now(), sender: "user", content: "", image: URL.createObjectURL(file), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "sent" }]); }} />
                        <div className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                          <Paperclip className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowOfferModal(true)}
                        className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
                      >
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                  className="flex-1 min-w-0"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showConversationList && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.2 }}
          >
            <MobileNav />
          </motion.div>
        )}
      </AnimatePresence>

      <CreateOfferModal open={showOfferModal} onOpenChange={setShowOfferModal} />
    </div>
  );
};

export default Messages;