import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.status(200).json(meetups);
  }

  async show(req, res) {
    const { id } = req.params;
    const meetup = await Meetup.findByPk(id, {
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    return res.status(200).json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
      location: Yup.string().required('Location is required'),
      date: Yup.date().required('Date is required'),
      file_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }

    const date = parseISO(req.body.date);

    if (isBefore(date, new Date())) {
      return res.status(400).json({ error: 'Invalid Meetup date' });
    }

    const meetup = await Meetup.create({
      user_id: req.userId,
      ...req.body,
    });

    return res.status(200).json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      file_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }

    const { id } = req.params;

    const meetup = await Meetup.findByPk(id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: 'You dont have permission to update this meetup.' });
    }

    const date = parseISO(req.body.date);

    if (isBefore(date, new Date())) {
      return res.status(400).json({ error: 'Invalid Meetup date' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'You cant update past meetups' });
    }

    await Meetup.update(
      {
        user_id: req.userId,
        ...req.body,
      },
      {
        where: { id },
      }
    );

    return res.status(200).json(meetup);
  }

  async delete(req, res) {
    const { id } = req.params;

    const meetup = await Meetup.findByPk(id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: 'You dont have permission to delete this meetup.' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: 'You cant delete past meetups' });
    }

    await meetup.destroy();

    return res.status(200).json({ ok: true });
  }
}

export default new MeetupController();
