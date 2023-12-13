import DetailButton from '@/components/Detail/DetailButton';
import PageMap from '@/components/PageMap';
import CommentInput from '@/components/QnA,Review/CommentInput';
import CommentItem from '@/components/QnA,Review/CommentItem';
import PageDetailTable from '@/components/QnA,Review/PageDetailTable';
import PageDetailTitle from '@/components/QnA,Review/PageDetailTitle';
import PageListOrder from '@/components/QnA,Review/PageListOrder';
import ReviewProductItem from '@/components/QnA,Review/ReviewProductItem';
import { useComment } from '@/store/useComment';
import { useUserInfo } from '@/store/useUserInfo';
import { AUTH_ID, AUTH_TOKEN } from '@/utils/AUTH_TOKEN';
import { sortQnaReviewData } from '@/utils/getProductsData';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

function QnaDetail() {
  const navigate = useNavigate();
  const [prevData, setPrevData] = useState<Replies | null>(null);
  const [currentData, setCurrentData] = useState<Replies | null>(null);
  const [nextData, setNextData] = useState<Replies | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { qnaComment, setDeleteQnaComment } = useComment();
  const { id } = useParams();
  const { userInfo, setUserInfo } = useUserInfo();
  const [editStatus, setEditStatus] = useState(false);

  // 댓글정렬
  const sortComment = sortQnaReviewData(qnaComment);

  // 게시글 삭제이벤트
  const handleDelete = async () => {
    const result = confirm('삭제하시겠습니까?');

    if (result) {
      await axios.delete(`https://localhost/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN()}`,
        },
      });

      toast('삭제되었습니다', {
        icon: '⭐',
        duration: 2000,
      });

      navigate(`${location.href.includes('qna') ? '/qna' : '/review'}`);
    }
  };

  // 댓글 삭제 이벤트
  const deleteComment = async (commentId: number) => {
    const result = confirm('삭제하시겠습니까?');

    if (result) {
      const res = await axios.delete(
        `https://localhost/api/posts/${id}/replies/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN()}`,
          },
        }
      );

      if (res.data.ok === 1) {
        toast('삭제하였습니다 :)', {
          icon: '🗑️',
          duration: 2000,
        });

        const exceptComment = qnaComment.filter((v) => v._id !== commentId);
        setDeleteQnaComment(exceptComment);
      }
    }
  };

  // 로그인유저정보 받아오기
  useEffect(() => {
    async function getUsers() {
      const res = await axios.get(`https://localhost/api/users/${AUTH_ID()}`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN()}`,
        },
      });

      setUserInfo(res.data.item);
    }

    if (AUTH_ID()) {
      getUsers();
    }
  }, [setUserInfo]);

  useEffect(() => {
    // 현재 데이터
    const repliesCurrentData = async () => {
      const res = await axios.get(`https://localhost/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN()}`,
        },
      });

      setCurrentData(res.data.item);
    };

    // 전체 데이터
    const repliesData = async () => {
      const res = await axios.get(`https://localhost/api/posts?type=qna`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN()}`,
        },
      });

      const qna = res.data.item;
      const currentQna = qna.filter((v: Replies) => v._id === Number(id));
      qna.forEach((v: Replies, i: number) => {
        if (v._id === Number(id)) {
          setCurrentIndex(i);
        }
      });

      setCurrentData(currentQna[0]);
      setPrevData(qna[currentIndex + 1]);
      setNextData(qna[currentIndex - 1]);
    };

    repliesCurrentData();
    repliesData();
  }, [currentIndex, id, setCurrentData]);

  // 댓글 데이터
  useEffect(() => {
    const repliesData = async () => {
      const res = await axios.get(`https://localhost/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN()}`,
        },
      });

      const commentData = res.data.item.replies;

      if (commentData) {
        const filterData = commentData.filter(
          (v: CommentData) => v.extra.boardId === Number(id)
        );
        setDeleteQnaComment(filterData);
      }
    };

    repliesData();
  }, [editStatus, id]);

  console.log(currentData);

  return (
    <>
      <Helmet>{currentData && <title>{currentData.title}</title>}</Helmet>

      <div>
        <PageMap route="qna" category="상품 Q&A" />
        <PageDetailTitle title="상품 Q&A" explan="상품 Q&A입니다." />
        {currentData && (
          <ReviewProductItem
            link={`/detail/${currentData.product_id}`}
            thumbnail={
              currentData.product?.image || currentData.extra?.product_image
            }
            name={currentData.product?.name || currentData.extra?.product_name}
          />
        )}
        {currentData && (
          <PageDetailTable
            title={currentData.title}
            writer={currentData.user?.name}
            createdAt={currentData.updatedAt}
            attachFile={currentData.extra ? currentData.extra.attachFile : ''}
            content={currentData.content}
          />
        )}
        {currentData && (
          <DetailButton
            btn1="목록"
            btn2="삭제"
            btn3="수정"
            onClick1={() => navigate('/qna')}
            onClick2={handleDelete}
            onClick3={() => navigate(`/edit-qna/${id}`)}
            style="quaReviewDetailButton"
            center="center"
            writer={currentData.user?._id}
          />
        )}

        {userInfo && <CommentInput writer={userInfo.name} collection="qna" />}
        {!userInfo && (
          <Link to="/login">
            <p className="center p-2 border bg-gray-100 my-5">
              회원에게만 댓글 작성 권한이 있습니다.
            </p>
          </Link>
        )}
        {sortComment.length > 0 &&
          sortComment.map((v, i) => (
            <CommentItem
              key={i}
              writer={v.user?.name}
              createdAt={v.updatedAt}
              content={v.content}
              writerId={v.user?._id ? v.user?._id : 0}
              onDelete={() => deleteComment(v._id ? v._id : 0)}
              commentId={v._id ? v._id : 0}
              status={editStatus}
              setStatus={setEditStatus}
            />
          ))}

        <p className="center border-t-4 border-t-starPink py-2"></p>

        <PageListOrder
          prev={prevData}
          next={nextData}
          prevLink={`/qna-detail/${prevData?._id}`}
          nextLink={`/qna-detail/${nextData?._id}`}
        />
      </div>
    </>
  );
}

export default QnaDetail;
