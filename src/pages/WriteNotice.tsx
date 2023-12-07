import PageMainTitle from '@/components/PageMainTitle';
import FormCkEditor from '@/components/QnA,Review/FormCkEditor';
import FormTitleInput from '@/components/QnA,Review/FormTitleInput';
import WriteButton from '@/components/QnA,Review/WriteButton';
import { useForm } from '@/store/useForm';
import { AUTH_TOKEN } from '@/utils/AUTH_TOKEN';
import axios from 'axios';
import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function WriteNotice() {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const { content, attachFile } = useForm();

  // Notice 등록하기 (Axios)
  const handleRegistNotice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content) {
      toast('내용을 입력해주세요 :)', {
        icon: '⭐',
        duration: 2000,
      });
    } else if (titleRef.current) {
      const newNotice = {
        rating: 1,
        product_id: 1,
        content,
        extra: {
          tag: '공지',
          type: 'notice',
          title: titleRef.current.value,
          attachFile: attachFile,
        },
      };

      const response = await axios.post(
        'https://localhost/api/replies/',
        newNotice,
        {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN()}`,
          },
        }
      );

      if (response.data.ok === 1) {
        toast('업로드하였습니다 :)', {
          icon: '⭐',
          duration: 2000,
        });

        navigate(`/qnaNotice/${response.data.item._id}`);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Q&A 작성하기</title>
      </Helmet>

      <main>
        <PageMainTitle title="공지 등록" />
        <form className="w-4/5 mx-auto" onSubmit={handleRegistNotice}>
          <table className="w-full border-t border-gray-300">
            <tbody>
              <FormTitleInput titleRef={titleRef} />
              <FormCkEditor />
            </tbody>
          </table>
          <WriteButton link="-1" />
        </form>
      </main>
    </>
  );
}

export default WriteNotice;
