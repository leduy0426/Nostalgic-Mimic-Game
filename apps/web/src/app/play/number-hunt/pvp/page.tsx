'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Copy, Check, Play, Trophy, Sparkles, Swords, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { usePvPSocket } from '@/hooks/use-pvp-socket';
import { AvatarDisplay } from '@/components/avatar/avatar-display';
import { NumberGrid } from '@/components/game/number-grid';
import { soundManager } from '@/lib/sound-effects';

export default function NumberHuntPvPPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    isConnected,
    room,
    countdown,
    matchOverData,
    disconnectNotice,
    createRoom,
    joinRoom,
    toggleReady,
    claimNumber,
  } = usePvPSocket(user);

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState('');

  const myPlayerId = user?.id || '';
  const myRoomPlayer = room?.players[myPlayerId];
  const opponentPlayer = room
    ? Object.values(room.players).find((p) => p.id !== myPlayerId)
    : undefined;

  const handleCopyLink = () => {
    if (!room) return;
    soundManager.playClick();
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    if (!inputCode.trim()) return;
    joinRoom(inputCode.trim(), (err) => setJoinError(err));
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playClick();
            router.push('/');
          }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-ink bg-paper-panel hover:bg-paper-border transition shadow-retro-sm btn-retro"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Hub</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-retro-red'
            }`}
          />
          <span className="text-ink-muted">
            {isConnected ? 'Máy chủ đối kháng kết nối' : 'Đang kết nối...'}
          </span>
        </div>
      </div>

      {/* Disconnect Alert */}
      {disconnectNotice && (
        <div className="p-3 rounded-2xl border-2 border-retro-amber bg-retro-amber/20 text-ink text-xs font-bold animate-pulse text-center">
          {disconnectNotice}
        </div>
      )}

      {/* VIEW 1: No Room (Lobby Entry) */}
      {!room && (
        <div className="rounded-3xl border-4 border-ink bg-paper p-6 md:p-8 shadow-retro text-center space-y-6">
          <div>
            <div className="w-16 h-16 mx-auto rounded-2xl border-3 border-ink bg-retro-blue text-paper flex items-center justify-center font-black text-2xl shadow-retro-sm mb-3">
              <Swords className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-ink">
              Phòng Đấu Tìm Số 1–25
            </h2>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
              Tranh tài bấm số đồng thời cùng bạn bè trên một bảng 25 số duy nhất. Ai nhanh tay bấm trước sẽ giành điểm!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
            <button
              onClick={createRoom}
              disabled={!isConnected}
              className="w-full py-4 px-4 rounded-2xl border-3 border-ink bg-retro-amber hover:bg-retro-amber/90 text-ink font-black text-sm transition shadow-retro btn-retro disabled:opacity-50"
            >
              + Tạo Phòng Chơi Mới
            </button>

            <form onSubmit={handleJoin} className="space-y-2">
              <input
                type="text"
                placeholder="Nhập mã phòng (vd: NH-8492)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full text-center uppercase tracking-widest px-3 py-2.5 rounded-xl border-2 border-ink bg-paper-panel text-sm font-mono font-black focus:outline-none"
              />
              <button
                type="submit"
                disabled={!isConnected || !inputCode.trim()}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-ink bg-retro-blue text-paper font-black text-xs hover:bg-retro-blue/90 transition shadow-retro-sm btn-retro disabled:opacity-50"
              >
                Tham Gia Phòng
              </button>
            </form>
          </div>

          {joinError && (
            <p className="text-xs font-bold text-retro-red">{joinError}</p>
          )}
        </div>
      )}

      {/* VIEW 2: In Room - WAITING / READY */}
      {room && room.status !== 'PLAYING' && room.status !== 'FINISHED' && (
        <div className="rounded-3xl border-4 border-ink bg-paper p-6 md:p-8 shadow-retro text-center space-y-6">
          {/* Room Code Header */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-ink bg-paper-panel shadow-retro-sm">
            <span className="text-xs font-black text-ink-muted">MÃ PHÒNG:</span>
            <span className="text-xl font-black font-mono tracking-wider text-retro-blue">
              {room.roomCode}
            </span>
            <button
              onClick={handleCopyLink}
              title="Sao chép mã phòng"
              className="p-1 rounded-lg hover:bg-paper-border transition text-ink"
            >
              {copied ? (
                <Check className="w-4 h-4 text-retro-green" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Versus Display */}
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Player 1 (Me) */}
            <div className="p-4 rounded-2xl border-3 border-ink bg-paper-panel flex flex-col items-center">
              <AvatarDisplay
                color={myRoomPlayer?.avatar?.color}
                hat={myRoomPlayer?.avatar?.hat}
                glasses={myRoomPlayer?.avatar?.glasses}
                size="lg"
              />
              <span className="font-black text-sm text-ink mt-2">
                {myRoomPlayer?.nickname} (Bạn)
              </span>
              <span
                className={`mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                  myRoomPlayer?.isReady
                    ? 'bg-retro-green/20 text-retro-green border-retro-green'
                    : 'bg-paper-border text-ink-muted border-ink/30'
                }`}
              >
                {myRoomPlayer?.isReady ? 'SẴN SÀNG' : 'CHƯA SẴN SÀNG'}
              </span>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="p-4 rounded-2xl border-3 border-ink bg-paper-panel flex flex-col items-center">
              {opponentPlayer ? (
                <>
                  <AvatarDisplay
                    color={opponentPlayer.avatar?.color}
                    hat={opponentPlayer.avatar?.hat}
                    glasses={opponentPlayer.avatar?.glasses}
                    size="lg"
                  />
                  <span className="font-black text-sm text-ink mt-2">
                    {opponentPlayer.nickname}
                  </span>
                  <span
                    className={`mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      opponentPlayer.isReady
                        ? 'bg-retro-green/20 text-retro-green border-retro-green'
                        : 'bg-paper-border text-ink-muted border-ink/30'
                    }`}
                  >
                    {opponentPlayer.isReady ? 'SẴN SÀNG' : 'CHƯA SẴN SÀNG'}
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-ink-muted">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-ink/40 flex items-center justify-center mb-2 animate-spin">
                    ⏳
                  </div>
                  <span className="text-xs font-bold">Đang chờ bạn vào...</span>
                </div>
              )}
            </div>
          </div>

          {/* Ready Action */}
          <div>
            <button
              onClick={() => toggleReady(!myRoomPlayer?.isReady)}
              disabled={!opponentPlayer}
              className={`w-full max-w-xs py-3.5 px-6 rounded-2xl border-3 border-ink font-black text-base transition shadow-retro btn-retro ${
                myRoomPlayer?.isReady
                  ? 'bg-paper-panel text-ink hover:bg-paper-border'
                  : 'bg-retro-amber hover:bg-retro-amber/90 text-ink'
              } disabled:opacity-50`}
            >
              {myRoomPlayer?.isReady ? 'Hủy Sẵn Sàng' : 'Tôi Đã Sẵn Sàng!'}
            </button>
            {!opponentPlayer && (
              <p className="text-xs text-ink-muted mt-2 font-medium">
                Gửi mã phòng <span className="font-mono font-bold text-ink">{room.roomCode}</span> cho đối thủ để cùng chơi!
              </p>
            )}
          </div>
        </div>
      )}

      {/* COUNTDOWN MODAL */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
          <div className="text-8xl font-black font-mono text-retro-amber animate-ping select-none">
            {countdown > 0 ? countdown : 'BẮT ĐẦU!'}
          </div>
        </div>
      )}

      {/* VIEW 3: MATCH ACTIVE (`PLAYING`) */}
      {room && (room.status === 'PLAYING' || room.status === 'FINISHED') && (
        <div className="space-y-4">
          {/* Live PvP Scoreboard */}
          <div className="rounded-2xl border-3 border-ink bg-paper p-3 md:p-4 shadow-retro-sm grid grid-cols-3 items-center">
            {/* My Score */}
            <div className="flex items-center gap-2">
              <AvatarDisplay
                color={myRoomPlayer?.avatar?.color}
                hat={myRoomPlayer?.avatar?.hat}
                glasses={myRoomPlayer?.avatar?.glasses}
                size="sm"
              />
              <div className="text-left">
                <div className="text-[10px] text-ink-muted font-bold truncate max-w-[80px]">
                  {myRoomPlayer?.nickname}
                </div>
                <div className="text-2xl font-black font-mono text-retro-blue">
                  {myRoomPlayer?.score || 0}
                </div>
              </div>
            </div>

            {/* Target Number */}
            <div className="text-center">
              <div className="text-[10px] text-ink-muted font-black uppercase tracking-wider">
                Số Cần Bấm
              </div>
              <div className="text-3xl font-black font-mono text-retro-red">
                {room.targetNumber <= 25 ? room.targetNumber : 'Xong!'}
              </div>
            </div>

            {/* Opponent Score */}
            <div className="flex items-center justify-end gap-2 text-right">
              <div>
                <div className="text-[10px] text-ink-muted font-bold truncate max-w-[80px]">
                  {opponentPlayer?.nickname}
                </div>
                <div className="text-2xl font-black font-mono text-retro-amber">
                  {opponentPlayer?.score || 0}
                </div>
              </div>
              <AvatarDisplay
                color={opponentPlayer?.avatar?.color}
                hat={opponentPlayer?.avatar?.hat}
                glasses={opponentPlayer?.avatar?.glasses}
                size="sm"
              />
            </div>
          </div>

          {/* 5x5 Synchronized Board */}
          <NumberGrid
            board={room.board}
            currentTarget={room.targetNumber}
            claimedCells={room.claimedCells}
            myPlayerId={myPlayerId}
            onNumberClick={(num) => claimNumber(num)}
            disabled={room.status !== 'PLAYING'}
          />

          <p className="text-center text-xs text-ink-muted font-medium">
            Bấm nhanh trước đối thủ! Điểm sẽ trao cho người có click gửi đến máy chủ trước.
          </p>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {matchOverData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-paper rounded-3xl border-4 border-ink p-6 md:p-8 shadow-retro-lg text-center relative">
            <div className="mb-4">
              {matchOverData.winnerId === myPlayerId ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-ink bg-retro-amber text-ink font-black text-xs uppercase tracking-wider shadow-retro-sm">
                  <Trophy className="w-4 h-4 fill-current text-ink" />
                  <span>CHIẾN THẮNG VANG DỘI!</span>
                </div>
              ) : matchOverData.isDraw ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-ink bg-paper-panel text-ink font-black text-xs uppercase tracking-wider shadow-retro-sm">
                  <span>HÒA NHAU!</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-ink bg-retro-red/20 text-retro-red font-black text-xs uppercase tracking-wider shadow-retro-sm">
                  <span>CHÚT NỮA LÀ THẮNG!</span>
                </div>
              )}
            </div>

            <h2 className="text-3xl font-black text-ink mb-1">
              {matchOverData.winnerId === myPlayerId
                ? 'Bạn Đã Thắng!'
                : matchOverData.isDraw
                ? 'Bất Phân Thắng Bại!'
                : 'Đối Thủ Đã Thắng!'}
            </h2>
            <p className="text-xs text-ink-muted">
              {matchOverData.reason || 'Trận đấu 25 điểm đã kết thúc'}
            </p>

            {/* Score Comparison */}
            <div className="my-5 p-4 rounded-2xl border-2 border-ink bg-paper-panel shadow-retro-sm flex items-center justify-around">
              <div>
                <div className="text-xs font-bold text-ink-muted">Bạn</div>
                <div className="text-3xl font-black font-mono text-retro-blue">
                  {matchOverData.scores[myPlayerId] || 0}
                </div>
                <div className="text-[11px] font-bold text-retro-green">
                  +{matchOverData.xpAwarded[myPlayerId] || 0} XP
                </div>
              </div>

              <div className="text-2xl font-black text-ink/30">:</div>

              <div>
                <div className="text-xs font-bold text-ink-muted">
                  {opponentPlayer?.nickname}
                </div>
                <div className="text-3xl font-black font-mono text-retro-amber">
                  {opponentPlayer ? matchOverData.scores[opponentPlayer.id] || 0 : 0}
                </div>
                <div className="text-[11px] font-bold text-retro-green">
                  +{opponentPlayer ? matchOverData.xpAwarded[opponentPlayer.id] || 0 : 0} XP
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  toggleReady(true);
                  // clear modal
                  usePvPSocket;
                  window.location.reload();
                }}
                className="w-full py-3.5 px-4 rounded-2xl border-3 border-ink bg-retro-amber hover:bg-retro-amber/90 text-ink font-black text-sm transition shadow-retro btn-retro"
              >
                Chơi Ván Khác
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  router.push('/');
                }}
                className="w-full py-2.5 px-4 rounded-2xl border-2 border-ink bg-paper-panel hover:bg-paper-border text-ink font-bold text-xs transition shadow-retro-sm btn-retro"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
