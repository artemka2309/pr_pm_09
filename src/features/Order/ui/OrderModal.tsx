"use client";
import React, { useState } from "react";
import {
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Checkbox,
} from "@heroui/react";
import Image from "next/image";
import useCartStore from "../../../store/cartStore"; // Обновленный путь
import { formatPrice } from "../../../shared/lib/formatPrice"; // Обновленный путь
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";

// Валидационная схема с использованием yup
const validationSchema = yup.object({
    name: yup
        .string()
        .matches(/^[а-яА-ЯёЁ\s]+$/, "Имя должно быть на русском")
        .required("Имя обязательно"),
    phone: yup
        .string()
        .matches(/^\+7\d{10}$/, "Телефон должен быть в формате +7XXXXXXXXXX")
        .required("Телефон обязателен"),
    comment: yup
        .string()
        .max(200, "Комментарий не должен превышать 200 символов"),
    isAgreed: yup
        .boolean()
        .oneOf([true], "Необходимо согласие на обработку персональных данных"),
});

export default function OrderModal({
    isOpen,
    onOpenChange,
    discountAmount, // Используйте discountAmount вместо discountPercent
    finalPrice,
    onOrderSuccess,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { cartItems } = useCartStore();
    const selectedItems = cartItems.filter(
        (item) => item.isSelected && item.quantity > 0
    );
    const totalAmount = selectedItems.reduce((total, item) => {
        const price =
            item.price_discount !== null && item.price_discount < item.price
                ? item.price_discount
                : item.price;
        return total + price * item.quantity;
    }, 0);

    const discountedTotal = finalPrice;

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: "",
            phone: "",
            comment: "",
            isAgreed: false,
        },
    });

    const onSubmit = async (values) => {
        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);

        let promoCode = localStorage.getItem("promoCode");
        if (promoCode === "") {
            promoCode = null;
        }

        let comment = values.comment;
        if (comment === "") {
            comment = null;
        }

        const orderData = {
            name: values.name,
            phone: values.phone,
            comment: comment,
            promocode: promoCode,
            selectedItems: selectedItems.map((item) => ({
                quantity: item.quantity,
                slug: item.slug,
                color: item.color,
            })),
        };

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API_URL_CLIENT}${process.env.NEXT_PUBLIC_GET_ORDERS}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(orderData),
                }
            );

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Превышен лимит заказов на сегодня.");
                } else {
                    throw new Error("Проблемы с интернетом.");
                }
            } else {
                toast.success("Заказ успешно отправлен!");
                onOrderSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error("Error submitting order:", error);
            toast.error(error.message || "Ошибка при отправке заказа.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const commentValue = watch("comment");

    return (
        <Modal
            size={"xl"}
            placement={"center"}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="max-h-screen overflow-y-auto"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Заказ
                        </ModalHeader>
                        <ModalBody>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="mb-4">
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                autoFocus
                                                label="Имя"
                                                placeholder="Введите своё имя"
                                                variant="bordered"
                                                isInvalid={!!errors.name}
                                                errorMessage={
                                                    errors.name
                                                        ? errors.name.message
                                                        : ""
                                                }
                                            />
                                        )}
                                    />
                                </div>
                                <div className="mb-4">
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Телефон"
                                                placeholder="Введите свой телефон"
                                                variant="bordered"
                                                type="tel"
                                                isInvalid={!!errors.phone}
                                                errorMessage={
                                                    errors.phone
                                                        ? errors.phone.message
                                                        : ""
                                                }
                                                onChange={(e) => {
                                                    let formattedPhone = e.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    );
                                                    if (
                                                        formattedPhone.length >
                                                        11
                                                    ) {
                                                        formattedPhone = formattedPhone.slice(
                                                            0,
                                                            11
                                                        );
                                                    }
                                                    if (
                                                        formattedPhone.startsWith(
                                                            "7"
                                                        )
                                                    ) {
                                                        formattedPhone =
                                                            "+" + formattedPhone;
                                                    } else if (
                                                        formattedPhone.startsWith(
                                                            "8"
                                                        )
                                                    ) {
                                                        formattedPhone =
                                                            "+7" +
                                                            formattedPhone.slice(
                                                                1
                                                            );
                                                    } else if (
                                                        !formattedPhone.startsWith(
                                                            "+7"
                                                        )
                                                    ) {
                                                        formattedPhone =
                                                            "+7" + formattedPhone;
                                                    }
                                                    field.onChange(
                                                        formattedPhone
                                                    );
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="">
                                    <Controller
                                        name="comment"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Комментарий"
                                                placeholder="Введите комментарий"
                                                variant="bordered"
                                                isInvalid={!!errors.comment}
                                                errorMessage={
                                                    errors.comment
                                                        ? errors.comment.message
                                                        : ""
                                                }
                                            />
                                        )}
                                    />
                                    <div className="text-right text-xs text-gray-500">
                                        {commentValue.length}/200
                                    </div>
                                </div>
                                <div className="flex pb-4 pt-1 px-1 justify-between items-center">
                                    <Controller
                                        name="isAgreed"
                                        control={control}
                                        render={({ field: { onChange, onBlur, name, ref } }) => (
                                            <Checkbox
                                                isSelected={control._getWatch("isAgreed")}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                name={name}
                                                ref={ref}
                                                color={
                                                    errors.isAgreed
                                                        ? "danger"
                                                        : "primary"
                                                }
                                            >
                                                <p
                                                    className={`text-sm ${errors.isAgreed
                                                        ? "text-danger"
                                                        : ""
                                                        }`}
                                                >
                                                    Даю разрешение на обработку
                                                    персональных данных
                                                </p>
                                            </Checkbox>
                                        )}
                                    />
                                </div>

                                <div className="bg-light p-2 rounded-lg">
                                    <h3 className="text-base font-semibold mb-2">
                                        Выбранные товары:
                                    </h3>
                                    <ul
                                        className={`space-y-2 px-1 pr-2 ${selectedItems.length > 2
                                            ? "max-h-48 overflow-y-auto"
                                            : ""
                                            } md:${selectedItems.length > 3
                                                ? "max-h-36 overflow-y-auto"
                                                : ""
                                            }`}
                                    >
                                        {selectedItems.map((item) => (
                                            <li
                                                key={`${item.slug}-${item.colorSlug}`}
                                                className="flex justify-between items-center border-b border-gray/50 pb-2"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-16 object-cover rounded-lg"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Модель: {item.color}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Количество:{" "}
                                                            {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {formatPrice(
                                                        item.price_discount !==
                                                            null &&
                                                            item.price_discount <
                                                            item.price
                                                            ? item.price_discount *
                                                            item.quantity
                                                            : item.price *
                                                            item.quantity
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex justify-between mt-2">
                                        <span className="font-semibold">
                                            Итого:
                                        </span>
                                        <span className="font-semibold">
                                            {formatPrice(discountedTotal)}
                                        </span>
                                    </div>
                                </div>

                                <ModalFooter>
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        onPress={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Закрыть
                                    </Button>
                                    <Button
                                        color="primary"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Отправка..."
                                            : "Отправить заявку"}
                                    </Button>
                                </ModalFooter>
                            </form>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
} 