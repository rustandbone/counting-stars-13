import toast from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { putWish } from '@/utils/HandleWish';
import axios from 'axios';

const fetchData = async (id: number) => {
  const response = await axios.get(`/products`, {
    params: {
      custom: JSON.stringify({
        'extra.depth': 2,
        'extra.parent': id,
      }),
    },
  });
  return response.data.item;
};

function DetailProductSelect({
  id,
  name,
  price,
  option,
}: {
  id: number;
  name: string;
  price: number;
  option: { [key: string]: string }[] | string[];
}) {
  const [info] = useState<{ [key: string]: number }>({});
  const [optionId] = useState<{ [key: string]: number }>({});
  const [count, setCount] = useState<{ [key: string]: number }>({});
  const [selectOption, setSelectOption] = useState<string[]>([]);

  useEffect(() => {
    const processOptionData = async (id: number) => {
      try {
        const data = await fetchData(id);
        data.map((item: ProductData) => {
          info[item.option] = item.price;
          optionId[item.option] = item._id;
          count[item.option] = 0;
        });
      } catch (error) {
        toast.error(`${error}가 발생했습니다. 잠시 후 시도해주세요.`);
      }
    };

    processOptionData(id);
  }, [option, price, info]);

  const handleClickUp = (item: string) => {
    if (count[item] > 98) return;
    setCount((prevCount) => ({ ...prevCount, [item]: prevCount[item] + 1 }));
  };

  const handleClickDown = (item: string) => {
    if (count[item] < 2) return;
    setCount((prevCount) => ({ ...prevCount, [item]: prevCount[item] - 1 }));
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectOption.includes(e.target.value) || e.target.value === '') return;
    if (count[e.target.value] === 0) {
      setCount((prevCount) => ({ ...prevCount, [e.target.value]: 1 }));
    }
    setSelectOption(selectOption.concat(e.target.value));
  };

  const optionDelete = (item: string) => {
    setSelectOption(selectOption.filter((opt) => opt !== item));
    setCount((prevCount) => ({ ...prevCount, [item]: 0 }));
  };

  const putCart = () => {
    if (selectOption.length === 0) {
      toast.error('옵션을 선택해주세요.');
      return;
    }

    Promise.all(
      selectOption.map(async (item) => {
        const cart = {
          product_id: optionId[item],
          quantity: count[item],
        };

        await axiosInstance.post('/carts', cart);
      })
    );

    toast.success('장바구니에 담았습니다.');
  };

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   id: number
  // ) => {
  // console.log(e.target.value);
  // console.log(id, count[id]);
  // };

  return (
    <>
      <Helmet>
        <title>{name} - 별,해달</title>
      </Helmet>
      <fieldset className="py-5 flex border-b border-gray-300">
        <label htmlFor="selectOption" className="w-32">
          옵션 선택
        </label>
        <select
          name="selectOption"
          id="selectOption"
          onChange={handleSelect}
          value={''}
          className="border border-gray-300 grow p-1"
        >
          <option value="">[필수] 옵션을 선택해 주세요</option>
          <option value="" disabled>
            ---
          </option>

          {option[0] instanceof Object && (
            <optgroup label={Object.keys(option[0])[0]}>
              {(option as { [key: string]: string }[]).map((item, index) => {
                const key = Object.keys(item)[0];
                return (
                  <option key={index} value={item[key]}>
                    {item[key]}
                  </option>
                );
              })}
            </optgroup>
          )}

          {typeof option[0] === 'string' &&
            (option as string[]).map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
        </select>
      </fieldset>
      {selectOption.length > 0 &&
        selectOption.map((item: string, index) => (
          <fieldset key={index} className="optionFieldset">
            <div className="min-w-[50%]">
              <p className="text-sm">{name}</p>
              <span className="text-sm font-semibold">{item}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border-2 h-9 rounded-lg justify-around mb-2">
                <input
                  type="text"
                  className="w-9 pl-1"
                  value={count[item]}
                  // onChange={(e) => handleInputChange(e, item)}
                  readOnly
                />
                <div className="flex flex-col gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleClickUp(item)}
                    className="hover:scale-150 transition-transform"
                  >
                    <img src="/cartArrowUp.png" className="w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClickDown(item)}
                    className="hover:scale-150 transition-transform"
                  >
                    <img src="/cartArrowDown.png" className="w-3" />
                  </button>
                </div>
              </div>
              {option.length > 0 && (
                <button type="button" onClick={() => optionDelete(item)}>
                  <img
                    src="/cancel.png"
                    alt="옵션 닫기"
                    className="w-4 hover:scale-125 transition-transform"
                  />
                </button>
              )}
            </div>
            {!item.includes('+') && !item.includes('-') && (
              <span className="text-sm">{price.toLocaleString()} 원</span>
            )}
            {(item.includes('+') || item.includes('-')) && (
              <span className="text-sm">{info[item].toLocaleString()} 원</span>
            )}
          </fieldset>
        ))}
      <p className="py-6 border-b border-b-gray-300">
        <span className="font-bold">총 상품 금액</span>&#40;수량&#41; :
        <span className="font-bold text-2xl pl-2">
          {Object.entries(count)
            .reduce((acc, cur) => {
              return acc + cur[1] * info[cur[0]];
            }, 0)
            .toLocaleString()}
          원
        </span>
        &#40;
        {Object.entries(count)
          .reduce((acc, cur) => {
            return acc + cur[1];
          }, 0)
          .toLocaleString()}
        개&#41;
      </p>

      <section className={`flex gap-4 justify-between py-5 mb-10`}>
        <button type="button" className="detailButton" onClick={putCart}>
          장바구니 담기
        </button>

        <button
          type="button"
          className="detailButton"
          onClick={() => putWish(id)}
        >
          찜하기
        </button>

        <button
          type="button"
          className={`detailButton bg-starBlack text-white`}
        >
          바로 구매하기
        </button>
      </section>
    </>
  );
}

export default DetailProductSelect;
